from fastapi import FastAPI

app = FastAPI()

@app.get("/api")
def test():
    return {"message": "minimal api works"}

@app.get("/api/health")
def health():
    return {"status": "ok"}


