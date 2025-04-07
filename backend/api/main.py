from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .routers import connectors, migrations

app = FastAPI(
    title="UniversalMigrate API",
    description="API for the UniversalMigrate platform",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(connectors.router)
app.include_router(migrations.router)

@app.get("/")
async def root():
    return {"message": "Welcome to UniversalMigrate API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
