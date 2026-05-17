import random
from fastapi import FastAPI
from pydantic import BaseModel
from pydantic import Field
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Payment Processing Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PaymentRequest(BaseModel):
    amount: float
    cvv: str = Field(pattern=r"^\d{3,4}$")


class PaymentResponse(BaseModel):
    approved: bool
    message: str
    code: str


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/process-payment", response_model=PaymentResponse)
async def procesar_pago(request: PaymentRequest):
    """
    Procesa un pago de manera simulada.
    80% de aprobación, 20% de rechazo (aleatorio)
    """
    approved = random.random() < 0.80
    
    if approved:
        return PaymentResponse(
            approved=True,
            message=f"Payment of ${request.amount:.2f} approved successfully",
            code="APPROVED"
        )
    else:
        return PaymentResponse(
            approved=False,
            message=f"Payment of ${request.amount:.2f} rejected",
            code="REJECTED"
        )
