import json
from typing import Any

from app.core.redis import redis_client

REQUEST_LIST_PREFIX = "cache:requests:list:"


def cache_get(key: str) -> Any | None:
    try:
        raw = redis_client.get(key)
        return json.loads(raw) if raw else None
    except Exception:
        return None


def cache_set(key: str, value: Any, ttl_seconds: int = 30) -> None:
    try:
        redis_client.set(key, json.dumps(value, default=str), ex=ttl_seconds)
    except Exception:
        pass


def invalidate_request_list_cache() -> None:
    try:
        for k in redis_client.scan_iter(match=f"{REQUEST_LIST_PREFIX}*", count=100):
            redis_client.delete(k)
    except Exception:
        pass
