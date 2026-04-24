from fastapi import APIRouter, HTTPException
from app.schemas import EmbedRequest, EmbedResponse
from app.models.embedder import bi_encoder
from app.comfig import get_settings

router = APIRouter(prefix="/embed", tags=["embedding"])

@router.post("", response_model=EmbedResponse, summary="Embed a single text")
async def embed_text(request: EmbedRequest) -> EmbedResponse:
    
    if not bi_encoder.is_loaded:
        raise HTTPException(status_code=503, detail="Embedding model not ready")
    
    if request.is_query:
        vector: bi_encoder.embed_query(request.text)
    else:
        vector: bi_encoder.embed_document(request.text)
    
    return EmbedResponse(
        vector = vector.tolist(),
        model = get_settings().bi_encoder_model,
        dimensions = len(vector),
    )