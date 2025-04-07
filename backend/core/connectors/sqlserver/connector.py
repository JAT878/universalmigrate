from typing import Dict, List, Any, Optional
import pyodbc
from ..base import BaseConnector, ConnectorConfig, SchemaObject, SchemaField

class SQLServerConfig(ConnectorConfig):
    connector_type: str = "sqlserver"

class SQLServerConnector(BaseConnector):
    """Connector for SQL Server databases"""
    
    async def connect(self) -> None:
        """Connect to SQL Server using pyodbc"""
        credentials = self.config.credentials
        connection_params = self.config.connection_params
        
        try:
            connection_string = f"DRIVER={{ODBC Driver 17 for SQL Server}};"
            connection_string += f"SERVER={credentials.get('server')};"
            connection_string += f"DATABASE={credentials.get('database')};"
            
            # Use trusted connection if no username/password provided
            if credentials.get('username') and credentials.get('password'):
                connection_string += f"UID={credentials.get('username')};"
                connection_string += f"PWD={credentials.get('password')};"
            else:
                connection_string += "Trusted_Connection=yes;"
                
            # Add additional connection parameters
            for key, value in connection_params.items():
                connection_string += f"{key}={value};"
                
            self.connection = pyodbc.connect(connection_string)
        except Exception as e:
            raise ConnectionError(f"Failed to connect to SQL Server: {str(e)}")
    
    async def disconnect(self) -> None:
        """Disconnect from SQL Server"""
        if self.connection:
            self.connection.close()
            self.connection = None
    
    async def get_schema(self) -> List[SchemaObject]:
        """Get SQL Server database schema"""
        if not self.connection:
            await self.connect()
            
        schema_objects = []
        cursor = self.connection.cursor()
        
        # Query for tables and views
        table_query = """
        SELECT 
            t.name AS table_name,
            CASE 
                WHEN t.type = 'U' THEN 'table'
                WHEN t.type = 'V' THEN 'view'
                ELSE t.type
            END AS table_type,
            p.value AS description
        FROM 
            sys.tables t
        LEFT JOIN 
            sys.extended_properties p ON p.major_id = t.object_id AND p.minor_id = 0 AND p.name = 'MS_Description'
        UNION
        SELECT 
            v.name AS table_name,
            'view' AS table_type,
            p.value AS description
        FROM 
            sys.views v
        LEFT JOIN 
            sys.extended_properties p ON p.major_id = v.object_id AND p.minor_id = 0 AND p.name = 'MS_Description'
        ORDER BY 
            table_name
        """
        
        tables = cursor.execute(table_query).fetchall()
        
        for table in tables:
            table_name = table[0]
            table_type = table[1]
            description = table[2]
            
            # Query for columns
            column_query = f"""
            SELECT 
                c.name AS column_name,
                t.name AS data_type,
                c.is_nullable,
                CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS is_primary_key,
                CASE WHEN fk.parent_column_id IS NOT NULL THEN OBJECT_NAME(fk.referenced_object_id) + '.' + COL_NAME(fk.referenced_object_id, fk.referenced_column_id) ELSE NULL END AS foreign_key,
                c.default_object_id,
                ep.value AS description
            FROM 
                sys.columns c
            JOIN 
                sys.types t ON c.user_type_id = t.user_type_id
            LEFT JOIN 
                sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            LEFT JOIN 
                sys.indexes pk ON pk.object_id = c.object_id AND pk.is_primary_key = 1 AND pk.index_id = ic.index_id
            LEFT JOIN 
                sys.foreign_key_columns fk ON fk.parent_object_id = c.object_id AND fk.parent_column_id = c.column_id
            LEFT JOIN 
                sys.extended_properties ep ON ep.major_id = c.object_id AND ep.minor_id = c.column_id AND ep.name = 'MS_Description'
            WHERE 
                c.object_id = OBJECT_ID(?)
            ORDER BY 
                c.column_id
            """
            
            columns = cursor.execute(column_query, table_name).fetchall()
            fields = []
            
            for column in columns:
                column_name = column[0]
                data_type = column[1]
                is_nullable = column[2]
                is_primary_key = column[3]
                foreign_key = column[4]
                default_value = column[5]
                description = column[6]
                
                fields.append(SchemaField(
                    name=column_name,
                    data_type=data_type,
                    nullable=is_nullable,
                    primary_key=is_primary_key == 1,
                    foreign_key=foreign_key,
                    default_value=default_value,
                    description=description
                ))
            
            schema_objects.append(SchemaObject(
                name=table_name,
                type=table_type,
                fields=fields,
                description=description
            ))
        
        cursor.close()
        return schema_objects
    
    async def extract_data(self, query: Optional[str] = None, object_name: Optional[str] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Extract data from SQL Server"""
        if not self.connection:
            await self.connect()
            
        cursor = self.connection.cursor()
        results = []
        
        try:
            if query:
                # Add limit to query if provided
                if limit and "TOP" not in query.upper():
                    # Insert TOP clause after SELECT
                    parts = query.split(' ', 1)
                    query = f"{parts[0]} TOP {limit} {parts[1]}"
                    
                cursor.execute(query)
            elif object_name:
                # If just object name is provided, select all fields
                limit_clause = f"TOP {limit} " if limit else ""
                query = f"SELECT {limit_clause}* FROM {object_name}"
                cursor.execute(query)
            else:
                raise ValueError("Either query or object_name must be provided")
            
            # Get column names
            columns = [column[0] for column in cursor.description]
            
            # Fetch all rows and convert to dictionaries
            for row in cursor.fetchall():
                row_dict = {}
                for i, value in enumerate(row):
                    row_dict[columns[i]] = value
                results.append(row_dict)
                
            return results
        finally:
            cursor.close()
    
    async def load_data(self, target_object: str, data: List[Dict[str, Any]]) -> int:
        """Load data into SQL Server"""
        if not self.connection:
            await self.connect()
            
        if not data:
            return 0
            
        cursor = self.connection.cursor()
        success_count = 0
        
        try:
            # Get column names from the first record
            columns = list(data[0].keys())
            
            # Prepare SQL statement for insert
            placeholders = '?' * len(columns)
            placeholder_str = f"({', '.join(placeholders)})"
            insert_sql = f"INSERT INTO {target_object} ({', '.join(columns)}) VALUES {placeholder_str}"
            
            # Execute inserts in batches
            for record in data:
                values = [record[column] for column in columns]
                cursor.execute(insert_sql, values)
                success_count += 1
                
            # Commit the transaction
            self.connection.commit()
            return success_count
        except Exception as e:
            # Rollback on error
            self.connection.rollback()
            raise e
        finally:
            cursor.close()
