import asyncpg
import os

DB_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres")

async def connect_db():
    return await asyncpg.connect(DB_URL)

# Simple health check or query test
async def ping_db():
    conn = await connect_db()
    result = await conn.fetchval("SELECT 1")
    await conn.close()
    return result
