from fastapi import FastAPI
import redis.asyncio as redis

app = FastAPI()
redis_client = None  # Global Redis connection placeholder


@app.on_event("startup")
async def startup_event():
    global redis_client
    redis_client = redis.Redis(host="nibiru-redis", port=6379, decode_responses=True)
    try:
        await redis_client.ping()
        print("✅ Connected to Redis")
    except redis.exceptions.ConnectionError:
        print("❌ Failed to connect to Redis")


@app.on_event("shutdown")
async def shutdown_event():
    await redis_client.close()
    print("🛑 Redis connection closed")


@app.get("/")
async def read_root():
    return {"message": "Hello from Docker!"}


@app.get("/cache/{key}")
async def get_cache(key: str):
    value = await redis_client.get(key)
    if value is None:
        return {"key": key, "value": None, "message": "Key not found"}
    return {"key": key, "value": value}


@app.post("/cache/{key}")
async def set_cache(key: str, value: str):
    await redis_client.set(key, value)
    return {"message": f"Set {key} = {value}"}

# app/main.py ← primary Docker app file

