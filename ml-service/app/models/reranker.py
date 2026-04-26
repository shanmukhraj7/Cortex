import logging
from app.config import get_settings
import numpy as np

logger = logging.getLogger(__name__)

class Reranker:
    """"
    Wraps cross-encoder/ms-marco-MiniLM-L-6-v2 for reranking.

    The cross-encoder sees the query and the each candiate document concatenated - much more than bi-encoder alone.
    This predicts the accurate one's.
    """

    def __init__(self) -> None:
        self._model = None
    
    def load(self) -> None:
        from sentence_transformers import CrossEncoder

        settings = get_settings()
        logging.info("Loading cross-encoder %s", settings.cross_encoder_model)
        self._model = CrossEncoder(
            settings.cross_encoder_model,
            cache_dir = settings.model_cache_dir,
            max_length=512,
        )
        self._model.predict([("warm up query", "warm up document")])
        logger.info("Ranker ready")

    def rerank(
        self,
        query: str,
        documents: list[str],
        top_k: int,
    ) -> tuple[list[int], list[float]]:
        """
        Score all (query, document) pairs and return the top-k indices
        sorted by descending relevance, alongside their scores.
        Returns:
            (top_indices, top_scores) — parallel lists, sorted best-first.
        """

        if self._model is None:
            raise RuntimeError("Reranker.load() has not been called")
        
        pairs = [(query, doc) for doc in documents]
        raw_scores: np.ndarray = self._model.predict(
            pairs, 
            show_progress_bar = False,
            convert_to_numpy = True,
        )
        sorted_indices = sorted(
            range(len(raw_scores)),
            key = lambda i: float(raw_scores[i]),
            reverse=True,
        )
        top_indices = sorted_indices[:top_k]
        top_scores = [float(raw_scores[i]) for i in top_indices]
        
        return top_indices, top_scores
    
    @property
    def is_loaded(self)->bool:
        return self._model is not None

reranker = Reranker()


