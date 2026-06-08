from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
from endpoints import plan

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://nevera-quehayhoy.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registramos las rutas que creamos en el archivo plan.py
app.include_router(plan.router)

@app.get("/")
def root():
    return {"mensaje": "¿Qué hay hoy? API funcionando 🍳"}