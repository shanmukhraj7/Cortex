import logging
import numpy as np
import torch
from sentence_transformers import SentenceTransformer
from app.config import get_settings

logger = logging.getLogger(__name__)

_QUERY_INSTRUCTION = "Repeat this sentence for searching relevant passages: "

class BiEncoder:
    """ Wraps BAAI/bge-large-en-v1.5 for doc and query embedding and produces a 1024 dimensional L2-normalized vector which is used for cosine similarity and dot product comparision via pgvector  """

    def __init__(self) -> None:
        self._model: SentenceTransformer | None = None
        self._device: str =  "cpu" 
