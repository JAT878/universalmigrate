from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from ...core.migration.engine import MigrationConfig, MigrationScheduler, MappingDefinition

router = APIRouter(prefix="/migrations", tags=["migrations"])

# In-memory migration scheduler (would be more robust in production)
migration_scheduler = MigrationScheduler()

class FieldMapping(BaseModel):
    source_field: str
    target_field: str
    transformation: Optional[str] = None

class MigrationRequest(BaseModel):
    source_connector_id: str
    target_connector_id: str
    source_object: str
    target_object: str
    field_mappings: List[FieldMapping]
    batch_size: int = 1000

class MigrationResponse(BaseModel):
    job_id: str
    status: str

from .connectors import active_connectors

@router.post("/", response_model=MigrationResponse)
async def create_migration(request: MigrationRequest):
    """Create and start a new migration job"""
    # Validate connectors exist
    if request.source_connector_id not in active_connectors:
        raise HTTPException(status_code=404, detail="Source connector not found")
    
    if request.target_connector_id not in active_connectors:
        raise HTTPException(status_code=404, detail="Target connector not found")
    
    source_connector = active_connectors[request.source_connector_id]["connector"]
    target_connector = active_connectors[request.target_connector_id]["connector"]
    
    # Create mapping definitions
    mappings = [MappingDefinition(
        source_field=m.source_field,
        target_field=m.target_field,
        transformation=m.transformation
    ) for m in request.field_mappings]
    
    # Create migration config
    config = MigrationConfig(
        source_connector=source_connector,
        target_connector=target_connector,
        source_object=request.source_object,
        target_object=request.target_object,
        field_mappings=mappings,
        batch_size=request.batch_size
    )
    
    # Schedule the migration
    job_id = await migration_scheduler.schedule_migration(config)
    
    return MigrationResponse(
        job_id=job_id,
        status="scheduled"
    )

@router.get("/{job_id}", response_model=Dict[str, Any])
async def get_migration_status(job_id: str):
    """Get the status of a migration job"""
    status = migration_scheduler.get_job_status(job_id)
    
    if status["status"] == "not_found":
        raise HTTPException(status_code=404, detail="Migration job not found")
    
    return status
