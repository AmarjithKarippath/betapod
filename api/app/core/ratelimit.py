from fastapi import HTTPException, status

from app.core.redis import redis_client


def rate_limit(key: str, limit: int, window_seconds: int) -> None:
    """Fixed-window counter. Raises 429 if limit exceeded."""
    redis_key = f"rl:{key}"
    try:
        count = redis_client.incr(redis_key)
        if count == 1:
            redis_client.expire(redis_key, window_seconds)
        if count > limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many requests. Please try again later.",
            )
    except HTTPException:
        raise
    except Exception:
        # If Redis is down, fail open rather than locking everyone out.
        return
