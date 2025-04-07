from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel
from ...core.connectors.base import SchemaObject
from ...core.connectors.salesforce.connector import SalesforceConnector, SalesforceConfig
from ...core.connectors.sqlserver.connector import SQLServerConnector, SQLServerConfig

router = APIRouter(prefix="/connectors", tags=["connectors"])

class ConnectorResponse(BaseModel):
    id: str
    type: str
    status: str

class SalesforceCredentials(BaseModel):
    username: str
    password: str
    security_token: str
    domain: str = "login"

class SQLServerCredentials(BaseModel):
    server: str
    database: str
    username: str = None
    password: str = None

# In-memory store for connectors (would be a database in production)
active_connectors = {}

@router.post("/salesforce", response_model=ConnectorResponse)
async def create_salesforce_connector(credentials: SalesforceCredentials):
    """Create a new Salesforce connector"""
    import uuid
    connector_id = str(uuid.uuid4())
    
    config = SalesforceConfig(
        credentials=credentials.dict()
    )
    
    connector = SalesforceConnector(config)
    
    # Test the connection
    try:
        await connector.connect()
        status = "connected"
    except Exception as e:
        status = f"error: {str(e)}"
    finally:
        await connector.disconnect()
    
    active_connectors[connector_id] = {
        "connector": connector,
        "type": "salesforce",
        "status": status
    }
    
    return ConnectorResponse(
        id=connector_id,
        type="salesforce",
        status=status
    )

@router.post("/sqlserver", response_model=ConnectorResponse)
async def create_sqlserver_connector(credentials: SQLServerCredentials):
    """Create a new SQL Server connector"""
    import uuid
    connector_id = str(uuid.uuid4())
    
    config = SQLServerConfig(
        credentials=credentials.dict()
    )
    
    connector = SQLServerConnector(config)
    
    # Test the connection
    try:
        await connector.connect()
        status = "connected"
    except Exception as e:
        status = f"error: {str(e)}"
    finally:
        await connector.disconnect()
    
    active_connectors[connector_id] = {
        "connector": connector,
        "type": "sqlserver",
        "status": status
    }
    
    return ConnectorResponse(
        id=connector_id,
        type="sqlserver",
        status=status
    )

@router.get("/{connector_id}/schema", response_model=List[Dict[str, Any]])
async def get_connector_schema(connector_id: str):
    """Get the schema for a connector"""
    if connector_id not in active_connectors:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector = active_connectors[connector_id]["connector"]
    
    try:
        schema = await connector.get_schema()
        return [s.dict() for s in schema]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{connector_id}", response_model=Dict[str, str])
async def delete_connector(connector_id: str):
    """Delete a connector"""
    if connector_id not in active_connectors:
        raise HTTPException(status_code=404, detail="Connector not found")
    
    connector = active_connectors[connector_id]["connector"]
    await connector.disconnect()
    
    del active_connectors[connector_id]
    
    return {"status": "deleted"}
