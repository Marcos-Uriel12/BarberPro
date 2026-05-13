from datetime import datetime, timedelta, timezone

import jwt

from app.config.settings import Settings


class JWTService:
    def __init__(self, settings: Settings) -> None:
        self._secret = settings.JWT_SECRET_KEY
        self._algorithm = settings.JWT_ALGORITHM
        self._expire_minutes = settings.JWT_EXPIRE_MINUTES

    def create_token(self, admin_id: str) -> str:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=self._expire_minutes
        )
        payload = {
            "sub": admin_id,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
        }
        return jwt.encode(payload, self._secret, algorithm=self._algorithm)

    def verify_token(self, token: str) -> dict | None:
        try:
            return jwt.decode(
                token,
                self._secret,
                algorithms=[self._algorithm],
            )
        except jwt.PyJWTError:
            return None
