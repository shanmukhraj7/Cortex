package com.cortex.notes.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.cortex.notes.client.MLServiceClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * Full-stack integration tests using a real PostgreSQL container (pgvector image).
 *
 * <p>The ML service is mocked — we verify HTTP contract and DB persistence,
 * not embedding quality.
 */
@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@DisplayName("NoteController integration tests")
class NoteControllerIntegrationTest {

    // pgvector image required for the vector(1024) column
    @Container
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>(DockerImageName.parse("pgvector/pgvector:pg16")
                    .asCompatibleSubstituteFor("postgres"))
                    .withDatabaseName("cortex_test")
                    .withUsername("cortex")
                    .withPassword("cortex");

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        // Disable Redis for integration tests — use no-op cache
        registry.add("spring.cache.type", () -> "none");
        registry.add("spring.data.redis.host", () -> "localhost");
        registry.add("spring.data.redis.port", () -> "6379");
    }

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockBean MLServiceClient mlServiceClient;

    private static final UUID USER_ID = UUID.randomUUID();
    private static final List<Float> FAKE_EMBEDDING =
            java.util.Collections.nCopies(1024, 0.0f);

    @BeforeEach
    void configureMocks() {
        when(mlServiceClient.embedDocument(anyString())).thenReturn(FAKE_EMBEDDING);
    }

    // ── POST /notes ───────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /notes — creates note and returns 201")
    void createNote_returns201() throws Exception {
        Map<String, Object> body = Map.of(
                "title", "Integration Test Note",
                "content", "Content for integration test",
                "tags", List.of("test", "integration"));

        mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration Test Note"))
                .andExpect(jsonPath("$.content").value("Content for integration test"))
                .andExpect(jsonPath("$.tags[0]").exists())
                .andExpect(jsonPath("$.id").exists());
    }

    @Test
    @DisplayName("POST /notes — returns 400 when title is blank")
    void createNote_400WhenBlankTitle() throws Exception {
        Map<String, Object> body = Map.of("title", "", "content", "Some content", "tags", List.of());

        mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /notes — returns 401 when X-User-Id header is missing")
    void createNote_401WithoutHeader() throws Exception {
        Map<String, Object> body = Map.of("title", "T", "content", "C", "tags", List.of());

        mockMvc.perform(post("/notes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /notes ────────────────────────────────────────────────────────

    @Test
    @DisplayName("GET /notes — returns paginated list")
    void listNotes_returnsList() throws Exception {
        // Create a note first
        Map<String, Object> body = Map.of("title", "List Test", "content", "List content", "tags", List.of());
        mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/notes")
                        .header("X-User-Id", USER_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notes").isArray())
                .andExpect(jsonPath("$.pagination.page").value(1));
    }

    // ── GET /notes/{id} ───────────────────────────────────────────────────

    @Test
    @DisplayName("GET /notes/{id} — returns note after creation")
    void getNote_returnsNoteById() throws Exception {
        // Create
        Map<String, Object> body = Map.of("title", "Fetch Me", "content", "Fetch content", "tags", List.of());
        MvcResult createResult = mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = createResult.getResponse().getContentAsString();
        String noteId = objectMapper.readTree(responseBody).get("id").asText();

        // Fetch
        mockMvc.perform(get("/notes/" + noteId)
                        .header("X-User-Id", USER_ID.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(noteId))
                .andExpect(jsonPath("$.title").value("Fetch Me"));
    }

    @Test
    @DisplayName("GET /notes/{id} — returns 404 for unknown note")
    void getNote_404ForUnknownId() throws Exception {
        mockMvc.perform(get("/notes/" + UUID.randomUUID())
                        .header("X-User-Id", USER_ID.toString()))
                .andExpect(status().isNotFound());
    }

    // ── PUT /notes/{id} ───────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /notes/{id} — updates note content")
    void updateNote_updatesContent() throws Exception {
        // Create
        Map<String, Object> createBody = Map.of("title", "Old Title", "content", "Old content", "tags", List.of());
        MvcResult createResult = mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createBody)))
                .andReturn();
        String noteId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Update
        Map<String, Object> updateBody = Map.of("title", "New Title", "content", "New content", "tags", List.of("updated"));
        mockMvc.perform(put("/notes/" + noteId)
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateBody)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Title"))
                .andExpect(jsonPath("$.content").value("New content"));
    }

    // ── DELETE /notes/{id} ────────────────────────────────────────────────

    @Test
    @DisplayName("DELETE /notes/{id} — deletes note and returns 204")
    void deleteNote_returns204() throws Exception {
        // Create
        Map<String, Object> body = Map.of("title", "Delete Me", "content", "Bye", "tags", List.of());
        MvcResult createResult = mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn();
        String noteId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Delete
        mockMvc.perform(delete("/notes/" + noteId)
                        .header("X-User-Id", USER_ID.toString()))
                .andExpect(status().isNoContent());

        // Verify gone
        mockMvc.perform(get("/notes/" + noteId)
                        .header("X-User-Id", USER_ID.toString()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /notes/{id} — cannot delete another user's note")
    void deleteNote_cannotDeleteOtherUsersNote() throws Exception {
        UUID otherUser = UUID.randomUUID();

        // Create as USER_ID
        Map<String, Object> body = Map.of("title", "Mine", "content", "My content", "tags", List.of());
        MvcResult createResult = mockMvc.perform(post("/notes")
                        .header("X-User-Id", USER_ID.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andReturn();
        String noteId = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();

        // Attempt delete as otherUser
        mockMvc.perform(delete("/notes/" + noteId)
                        .header("X-User-Id", otherUser.toString()))
                .andExpect(status().isNotFound());
    }
}