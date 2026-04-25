import logging
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from app.config import get_settings

logger = logging.getLogger(__name__)

_QUERY_INSTRUCTION = "Represent this sentence for searching relevant passages: "

class BiEncoder:
    """ Wraps BAAI/bge-large-en-v1.5 for doc and query embedding and produces a 1024 dimensional L2-normalized vector which is used for cosine similarity and dot product comparision via pgvector  """

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._device: str =  "cpu"
    
    def load(self) -> None:
        settings = get_settings()
        device = settings.device

        if device == "mps" and not torch.backends.mps.is_available():
            logger.warning("MPS is unavailable, switching back to CPU")
            device = "cpu"
        elif device == "cuda" and not torch.cuda.is_available():
            logger.warning("CUDA is unavailable, switching back to CPU")
            device = "cpu"
        
        self._device = device
        logger.info("Loading bi-encoder %s on %s", settings.bi_encoder_model, device)

        self._model = SentenceTransformer(
            settings.bi_encoder_model,
            cache_folder=settings.model_cache_dir,
            device=device
        )

        self._model.encode(["warm up"], normalize_embeddings=True)
        logger.info("Bi-encoder ready — dim=%d", self.dimensions)
    
    @property
    def dimensions(self) -> int:
        if self._model == None:
            return 0
        return self._model.get_sentence_embedding_dimension()
    
    def _encode(self, texts: list[str]) -> np.ndarray:
        if self._model is None:
            raise RuntimeError("BiEncoder.load() has not been called") 
        return self._model.encode(
            texts, 
            batch_size= get_settings().bi_encoder_batch_size,
            normalize_embeddings=True,
            show_progress_bar=False,
            convert_to_numpy=True,
        ).astype(np.float32)
    
    def embed_query(self, text: str) -> np.ndarray:
        return self._encode([_QUERY_INSTRUCTION + text])[0]
    
    def embed_document(self, text: str) -> np.ndarray:
        return self._encode([text])[0]
    
    def embed_document_batch(self, texts: list[str]) -> np.ndarray:
        return self._encode(texts)
    
    @property
    def is_loaded(self) -> bool:
        return self._model is not None
    
    @property
    def device(self) -> str:
        return self._device

bi_encoder = BiEncoder()

