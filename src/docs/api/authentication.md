
# API Authentication

This document describes the authentication and authorization mechanisms used in the CrewSUMMIT API.

## Authentication Methods

The CrewSUMMIT API supports the following authentication methods:

1. **JWT (JSON Web Tokens)** - Primary authentication method
2. **API Keys** - For service-to-service communication
3. **OAuth 2.0** - For integration with third-party services

## JWT Authentication

### Setup

Install the required dependencies:

```bash
pip install python-jose passlib
```

Configure JWT in the application:

```python
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

# Configuration
SECRET_KEY = "your-secret-key"  # Store in environment variables
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Token model
class Token(BaseModel):
    access_token: str
    token_type: str
    expires_at: datetime

# User model
class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
```

### Token Generation

Implement token generation:

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Set token expiration
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
    to_encode.update({"exp": expire})
    
    # Create JWT token
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt, expire

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Authenticate user
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token, expire = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_at": expire
    }
```

### Token Verification

Implement token verification:

```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
            
        # Get user from database
        user = get_user(username)
        if user is None:
            raise credentials_exception
            
        return user
        
    except JWTError:
        raise credentials_exception

async def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

### Protected Routes

Apply authentication to routes:

```python
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/agents")
async def get_agents(current_user: User = Depends(get_current_active_user)):
    # Implementation
    pass
```

## API Key Authentication

For service-to-service communication:

```python
from fastapi import Security, HTTPException
from fastapi.security.api_key import APIKeyHeader, APIKey

API_KEY_NAME = "X-API-Key"
API_KEY = "your-api-key"  # Store in environment variables

api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid API Key"
    )

@app.get("/service-endpoint")
async def service_endpoint(api_key: APIKey = Depends(get_api_key)):
    # Implementation
    pass
```

## OAuth 2.0 Integration

For third-party service integration:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from typing import Optional
import httpx

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://example.com/oauth/authorize",
    tokenUrl="https://example.com/oauth/token",
)

async def get_token_from_external_provider(
    code: str,
    client_id: str,
    client_secret: str,
    redirect_uri: str
):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://example.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri
            }
        )
        return response.json()

@app.get("/oauth/callback")
async def oauth_callback(code: str):
    # Exchange code for token
    token_response = await get_token_from_external_provider(
        code=code,
        client_id="your-client-id",
        client_secret="your-client-secret",
        redirect_uri="https://your-api.com/oauth/callback"
    )
    
    # Create or update user
    # Return JWT token
    pass
```

## Role-Based Access Control (RBAC)

Implement role-based authorization:

```python
from enum import Enum
from typing import List

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    SERVICE = "service"

class UserInDB(User):
    hashed_password: str
    roles: List[Role] = [Role.USER]

def has_role(required_roles: List[Role]):
    def _has_role(current_user: User = Depends(get_current_active_user)):
        for role in required_roles:
            if role in current_user.roles:
                return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return _has_role

@router.delete("/agents/{agent_id}")
async def delete_agent(
    agent_id: str,
    current_user: User = Depends(has_role([Role.ADMIN]))
):
    # Only admins can delete agents
    # Implementation
    pass
```

## Refresh Tokens

Implement token refresh functionality:

```python
class TokenData(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_at: datetime

@app.post("/token/refresh", response_model=TokenData)
async def refresh_token(refresh_token: str):
    try:
        # Verify refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Check if token is blacklisted
        if is_token_blacklisted(refresh_token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked"
            )
            
        # Get user from database
        user = get_user(username)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
            
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token, expire = create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        )
        
        # Create new refresh token
        refresh_token_expires = timedelta(days=30)
        new_refresh_token, _ = create_access_token(
            data={"sub": user.username, "type": "refresh"},
            expires_delta=refresh_token_expires
        )
        
        # Blacklist old refresh token
        blacklist_token(refresh_token)
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_at": expire
        }
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
```

## Token Revocation

Implement token revocation:

```python
@app.post("/token/revoke")
async def revoke_token(
    token: str,
    current_user: User = Depends(get_current_active_user)
):
    try:
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        
        # Only allow users to revoke their own tokens or admins to revoke any token
        if username != current_user.username and Role.ADMIN not in current_user.roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot revoke token for another user"
            )
            
        # Blacklist token
        blacklist_token(token)
        
        return {"message": "Token revoked successfully"}
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token"
        )
```

## API Authentication Client

Example TypeScript client for authentication:

```typescript
class AuthClient {
  private baseUrl: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          'username': username,
          'password': password
        })
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = new Date(data.expires_at);
      
      // Save tokens to localStorage or secure cookie
      localStorage.setItem('accessToken', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toISOString());
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
  
  async getAuthHeaders(): Promise<Record<string, string>> {
    // Check if token exists and is not expired
    if (!this.token || !this.tokenExpiry) {
      // Try to load from storage
      this.token = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      const expiryStr = localStorage.getItem('tokenExpiry');
      this.tokenExpiry = expiryStr ? new Date(expiryStr) : null;
      
      if (!this.token || !this.tokenExpiry) {
        throw new Error('Not authenticated');
      }
    }
    
    // Check if token is about to expire
    const now = new Date();
    if (this.tokenExpiry && this.tokenExpiry.getTime() - now.getTime() < 60000) {
      // Token expires in less than a minute, refresh it
      await this.refreshAccessToken();
    }
    
    return {
      'Authorization': `Bearer ${this.token}`
    };
  }
  
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/token/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: this.refreshToken
        })
      });
      
      if (!response.ok) {
        // Clear tokens and return false
        this.logout();
        return false;
      }
      
      const data = await response.json();
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = new Date(data.expires_at);
      
      // Update stored tokens
      localStorage.setItem('accessToken', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('tokenExpiry', this.tokenExpiry.toISOString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }
  
  logout(): void {
    this.token = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Clear stored tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  }
}
```

## Security Best Practices

1. **Use HTTPS**: Always use HTTPS in production
2. **Secure Tokens**: Store tokens securely and never expose them in URLs
3. **Token Expiration**: Use short-lived access tokens and longer-lived refresh tokens
4. **Token Validation**: Validate tokens on every request
5. **Rate Limiting**: Implement rate limiting for authentication endpoints
6. **Password Security**: Use strong password hashing and enforce password policies
7. **CORS**: Configure proper CORS headers
8. **Audit Logging**: Log authentication events for security auditing
