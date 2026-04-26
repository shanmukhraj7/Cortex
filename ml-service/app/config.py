from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        protected_namespaces=("settings_",),
    )

    database_url: str = "postgres://postgres:shannu2612@localhost:5432/cortex"
    
    # Device
    device: str = "mps"

    # Models
    bi_encoder_model: str = "BAAI/bge-large-en-v1.5"
    cross_encoder_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    model_cache_dir: str = "./model_cache"

    # Retrieval config
    bi_encoder_batch_size: int = 32
    top_k_retrieval: int = 20

    log_level: str = "INFO"

@lru_cache
def get_settings() -> Settings:
    return Settings()
