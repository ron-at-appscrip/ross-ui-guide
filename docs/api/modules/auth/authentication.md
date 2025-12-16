# Authentication Endpoints

## 📋 Overview

The Authentication API provides secure login, logout, token management, and session handling for the Ross AI platform. This module implements a hybrid authentication strategy combining Supabase OAuth capabilities with internal JWT tokens for enhanced security and scalability.

## 🔑 Authentication Flow

### Token Exchange Strategy

1. **Frontend** authenticates with Supabase (OAuth/Email)
2. **Frontend** exchanges Supabase token for internal JWT
3. **All API calls** use internal JWT with proper scoping
4. **Token refresh** handled seamlessly with Redis session management

## 🚪 Login Endpoints

### 1. Email/Password Login

**POST** `/api/v1/auth/login`

Authenticates a user with email and password credentials.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "remember_me": true,
  "device_name": "Chrome on MacOS"
}
```

#### Request Schema

```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    remember_me: bool = False
    device_name: Optional[str] = Field(None, max_length=100)
    
    @validator('email')
    def normalize_email(cls, v):
        return v.lower().strip()
```

#### Response

```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_abc123def456...",
    "token_type": "bearer",
    "expires_in": 86400,
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://storage.example.com/avatar.jpg",
      "email_verified": true,
      "phone_verified": false,
      "two_factor_enabled": false,
      "last_login": "2024-12-07T10:30:00Z",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "organization": {
      "id": "org_456",
      "name": "Law Firm LLP",
      "type": "small",
      "role": "attorney",
      "permissions": [
        "clients:read",
        "clients:write",
        "matters:read",
        "matters:write",
        "billing:read"
      ]
    },
    "session": {
      "id": "session_789",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "location": "New York, NY",
      "created_at": "2024-12-07T10:30:00Z"
    }
  }
}
```

#### Error Responses

```json
// 401 - Invalid Credentials
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": {
      "attempts_remaining": 3,
      "lockout_time": null
    }
  },
  "timestamp": "2024-12-07T10:30:00Z",
  "request_id": "req_abc123"
}

// 423 - Account Locked
{
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to multiple failed login attempts",
    "details": {
      "locked_until": "2024-12-07T11:00:00Z",
      "unlock_method": "time_based"
    }
  },
  "timestamp": "2024-12-07T10:30:00Z",
  "request_id": "req_abc123"
}

// 403 - Email Not Verified
{
  "error": {
    "code": "EMAIL_NOT_VERIFIED",
    "message": "Email address must be verified before login",
    "details": {
      "verification_sent": true,
      "can_resend_at": "2024-12-07T10:35:00Z"
    }
  },
  "timestamp": "2024-12-07T10:30:00Z",
  "request_id": "req_abc123"
}
```

#### Implementation

```python
@router.post("/auth/login", response_model=AuthResponse)
@limiter.limit("5/minute")  # Rate limiting
async def login(
    request: Request,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    # Track login attempts
    attempt_key = f"login_attempts:{credentials.email}"
    attempts = await redis.get(attempt_key)
    
    if attempts and int(attempts) >= 5:
        raise HTTPException(
            status_code=423,
            detail={
                "code": "ACCOUNT_LOCKED",
                "message": "Account temporarily locked",
                "details": {"locked_until": datetime.utcnow() + timedelta(minutes=30)}
            }
        )
    
    try:
        # Authenticate with Supabase
        supabase_response = await supabase_auth_service.authenticate(
            credentials.email, 
            credentials.password
        )
        
        if not supabase_response.user.email_confirmed_at:
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "EMAIL_NOT_VERIFIED",
                    "message": "Email address must be verified"
                }
            )
        
        # Get or create user in our database
        user = await user_service.get_or_create_from_supabase(
            db, supabase_response.user
        )
        
        # Generate internal tokens
        token_data = {
            "sub": str(user.id),
            "user": user.dict(exclude={"password_hash"}),
            "organization": user.organization.dict() if user.organization else None,
            "session": {
                "ip_address": request.client.host,
                "user_agent": request.headers.get("user-agent"),
                "device_name": credentials.device_name
            }
        }
        
        access_token = create_access_token(
            token_data,
            expires_delta=timedelta(hours=24 if credentials.remember_me else 8)
        )
        
        refresh_token = create_refresh_token(user.id)
        
        # Store session in Redis
        session_id = str(uuid.uuid4())
        session_data = {
            "user_id": str(user.id),
            "access_token": access_token,
            "refresh_token": refresh_token,
            "ip_address": request.client.host,
            "user_agent": request.headers.get("user-agent"),
            "device_name": credentials.device_name,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        
        session_ttl = timedelta(days=30 if credentials.remember_me else 1)
        await redis.setex(
            f"session:{session_id}",
            session_ttl,
            json.dumps(session_data, default=str)
        )
        
        # Update user last login
        await user_service.update_last_login(db, user.id)
        
        # Clear login attempts
        await redis.delete(attempt_key)
        
        # Log successful login
        await activity_service.log_activity(
            db, user.id, "user_login",
            details={
                "ip_address": request.client.host,
                "user_agent": request.headers.get("user-agent"),
                "device_name": credentials.device_name
            }
        )
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=int(session_ttl.total_seconds()),
            user=user,
            organization=user.organization,
            session={"id": session_id, **session_data}
        )
        
    except AuthenticationError:
        # Increment login attempts
        await redis.setex(attempt_key, timedelta(minutes=30), int(attempts or 0) + 1)
        
        raise HTTPException(
            status_code=401,
            detail={
                "code": "INVALID_CREDENTIALS",
                "message": "Invalid email or password",
                "details": {"attempts_remaining": 4 - int(attempts or 0)}
            }
        )
```

### 2. OAuth Token Exchange

**POST** `/api/v1/auth/oauth/exchange`

Exchanges a Supabase OAuth token for an internal JWT token.

#### Request Body

```json
{
  "supabase_token": "sb_jwt_token_here",
  "provider": "google",
  "device_name": "iPhone Safari"
}
```

#### Response

Same format as email/password login response.

#### Implementation

```python
@router.post("/auth/oauth/exchange", response_model=AuthResponse)
async def oauth_token_exchange(
    request: Request,
    oauth_data: OAuthExchangeRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    # Validate Supabase token
    try:
        supabase_user = await supabase_auth_service.get_user(oauth_data.supabase_token)
    except Exception:
        raise HTTPException(401, "Invalid Supabase token")
    
    # Get or create user
    user = await user_service.get_or_create_from_supabase(db, supabase_user)
    
    # Generate internal tokens (same logic as email login)
    # ... token generation logic
    
    return AuthResponse(...)
```

### 3. Magic Link Login

**POST** `/api/v1/auth/magic-link`

Sends a magic link for passwordless authentication.

#### Request Body

```json
{
  "email": "user@example.com",
  "redirect_url": "https://app.example.com/auth/callback"
}
```

#### Response

```json
{
  "message": "Magic link sent to your email",
  "expires_at": "2024-12-07T10:45:00Z",
  "can_resend_at": "2024-12-07T10:32:00Z"
}
```

### 4. Verify Magic Link

**POST** `/api/v1/auth/magic-link/verify`

Verifies a magic link token and logs the user in.

#### Request Body

```json
{
  "token": "magic_link_token_here",
  "device_name": "Chrome on Windows"
}
```

#### Response

Same format as email/password login response.

## 🔄 Token Management

### 5. Refresh Token

**POST** `/api/v1/auth/refresh`

Refreshes an expired access token using a refresh token.

#### Request Body

```json
{
  "refresh_token": "rt_abc123def456..."
}
```

#### Response

```json
{
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "rt_new123def456...",
    "token_type": "bearer",
    "expires_in": 86400
  }
}
```

#### Implementation

```python
@router.post("/auth/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    # Validate refresh token
    try:
        payload = jwt.decode(
            refresh_data.refresh_token,
            settings.JWT_REFRESH_SECRET_KEY,
            algorithms=["HS256"]
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Refresh token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid refresh token")
    
    user_id = payload.get("sub")
    session_id = payload.get("session_id")
    
    # Check if refresh token is blacklisted
    blacklist_key = f"blacklist:refresh:{refresh_data.refresh_token}"
    if await redis.exists(blacklist_key):
        raise HTTPException(401, "Refresh token revoked")
    
    # Get user
    user = await user_service.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise HTTPException(401, "User not found or inactive")
    
    # Generate new tokens
    new_access_token = create_access_token({"sub": user_id, "user": user.dict()})
    new_refresh_token = create_refresh_token(user_id, session_id)
    
    # Blacklist old refresh token
    await redis.setex(blacklist_key, timedelta(days=7), "revoked")
    
    # Update session
    session_key = f"session:{session_id}"
    session_data = await redis.get(session_key)
    if session_data:
        session_dict = json.loads(session_data)
        session_dict["access_token"] = new_access_token
        session_dict["refresh_token"] = new_refresh_token
        session_dict["last_activity"] = datetime.utcnow().isoformat()
        
        await redis.setex(session_key, timedelta(days=30), json.dumps(session_dict))
    
    return TokenRefreshResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=86400
    )
```

### 6. Token Validation

**POST** `/api/v1/auth/validate`

Validates an access token and returns user information.

#### Request Body

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response

```json
{
  "data": {
    "valid": true,
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    },
    "permissions": [
      "clients:read",
      "clients:write"
    ],
    "expires_at": "2024-12-08T10:30:00Z"
  }
}
```

## 🚪 Logout Endpoints

### 7. Logout

**POST** `/api/v1/auth/logout`

Logs out the current user and invalidates tokens.

#### Request Body

```json
{
  "revoke_all_sessions": false
}
```

#### Response

```json
{
  "message": "Logged out successfully",
  "revoked_sessions": 1,
  "logged_out_at": "2024-12-07T10:30:00Z"
}
```

#### Implementation

```python
@router.post("/auth/logout")
async def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
    redis: Redis = Depends(get_redis)
):
    # Get token payload to extract session info
    payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["RS256"])
    session_id = payload.get("session", {}).get("id")
    
    revoked_sessions = 0
    
    if logout_data.revoke_all_sessions:
        # Revoke all user sessions
        session_pattern = f"session:*:user:{current_user.id}"
        session_keys = await redis.keys(session_pattern)
        
        for key in session_keys:
            await redis.delete(key)
            revoked_sessions += 1
    else:
        # Revoke current session only
        if session_id:
            await redis.delete(f"session:{session_id}")
            revoked_sessions = 1
    
    # Blacklist current access token
    token_id = payload.get("jti")
    if token_id:
        exp = payload.get("exp")
        ttl = exp - int(datetime.utcnow().timestamp())
        if ttl > 0:
            await redis.setex(f"blacklist:access:{token_id}", ttl, "revoked")
    
    # Log logout activity
    await activity_service.log_activity(
        current_user.id, "user_logout",
        details={
            "revoked_all_sessions": logout_data.revoke_all_sessions,
            "revoked_sessions": revoked_sessions
        }
    )
    
    return {
        "message": "Logged out successfully",
        "revoked_sessions": revoked_sessions,
        "logged_out_at": datetime.utcnow().isoformat()
    }
```

### 8. Logout All Sessions

**POST** `/api/v1/auth/logout-all`

Logs out the user from all devices and sessions.

#### Response

```json
{
  "message": "Logged out from all sessions",
  "revoked_sessions": 5,
  "logged_out_at": "2024-12-07T10:30:00Z"
}
```

## 🔐 Password Management

### 9. Change Password

**POST** `/api/v1/auth/change-password`

Changes the user's password (requires current password).

#### Request Body

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!",
  "logout_other_sessions": true
}
```

#### Response

```json
{
  "message": "Password changed successfully",
  "force_relogin": true,
  "revoked_sessions": 3
}
```

### 10. Reset Password Request

**POST** `/api/v1/auth/reset-password`

Requests a password reset link.

#### Request Body

```json
{
  "email": "user@example.com",
  "redirect_url": "https://app.example.com/reset-password"
}
```

#### Response

```json
{
  "message": "Password reset link sent to your email",
  "expires_at": "2024-12-07T11:30:00Z",
  "can_resend_at": "2024-12-07T10:35:00Z"
}
```

### 11. Reset Password Confirm

**POST** `/api/v1/auth/reset-password/confirm`

Confirms password reset with token.

#### Request Body

```json
{
  "token": "reset_token_here",
  "new_password": "NewSecurePassword789!"
}
```

#### Response

```json
{
  "message": "Password reset successfully",
  "auto_login": false
}
```

## 📱 Multi-Factor Authentication

### 12. Enable 2FA

**POST** `/api/v1/auth/2fa/enable`

Enables two-factor authentication for the user.

#### Response

```json
{
  "data": {
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secret_key": "JBSWY3DPEHPK3PXP",
    "backup_codes": [
      "12345678",
      "87654321",
      "11223344"
    ]
  }
}
```

### 13. Verify 2FA Setup

**POST** `/api/v1/auth/2fa/verify`

Verifies 2FA setup with TOTP code.

#### Request Body

```json
{
  "totp_code": "123456"
}
```

#### Response

```json
{
  "message": "Two-factor authentication enabled successfully",
  "enabled_at": "2024-12-07T10:30:00Z"
}
```

### 14. Disable 2FA

**POST** `/api/v1/auth/2fa/disable`

Disables two-factor authentication.

#### Request Body

```json
{
  "password": "CurrentPassword123!",
  "totp_code": "123456"
}
```

#### Response

```json
{
  "message": "Two-factor authentication disabled successfully",
  "disabled_at": "2024-12-07T10:30:00Z"
}
```

## 📊 Session Management

### 15. List Active Sessions

**GET** `/api/v1/auth/sessions`

Lists all active sessions for the current user.

#### Response

```json
{
  "data": [
    {
      "id": "session_123",
      "device_name": "Chrome on MacOS",
      "ip_address": "192.168.1.100",
      "location": "New York, NY",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2024-12-07T10:30:00Z",
      "last_activity": "2024-12-07T14:22:00Z",
      "is_current": true
    }
  ]
}
```

### 16. Revoke Session

**DELETE** `/api/v1/auth/sessions/{session_id}`

Revokes a specific session.

#### Response

```json
{
  "message": "Session revoked successfully",
  "revoked_at": "2024-12-07T10:30:00Z"
}
```

## 🔒 Security Features

### Rate Limiting

- **Login attempts**: 5 per minute per IP/email
- **Password reset**: 3 per hour per email
- **Magic link**: 3 per hour per email
- **Token refresh**: 60 per hour per user
- **2FA operations**: 10 per hour per user

### Security Headers

All authentication endpoints include security headers:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### Audit Logging

All authentication events are logged with:
- User ID and email
- IP address and user agent
- Timestamp and action type
- Success/failure status
- Additional context (device, location)

This comprehensive authentication API provides secure, scalable user management with modern security practices and excellent developer experience.