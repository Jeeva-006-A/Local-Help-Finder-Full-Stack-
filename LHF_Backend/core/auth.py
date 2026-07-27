from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/customers/login") # Using arbitrary url for swagger

def get_current_user_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"id": int(user_id), "role": role}
    except JWTError as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials or token expired")

def get_current_customer(current_user: dict = Depends(get_current_user_token)):
    if current_user["role"] != "customer":
        raise HTTPException(status_code=403, detail="Not authorized to access customer resources")
    return current_user

def get_current_worker(current_user: dict = Depends(get_current_user_token)):
    if current_user["role"] != "worker":
        raise HTTPException(status_code=403, detail="Not authorized to access worker resources")
    return current_user

def get_current_admin(current_user: dict = Depends(get_current_user_token)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to access admin resources")
    return current_user
