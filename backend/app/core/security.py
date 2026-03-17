import os
import re
from copy import deepcopy
from cryptography.fernet import Fernet


def _get_fernet() -> Fernet:
    key = os.getenv("SECRET_KEY")
    if not key:
        raise ValueError("SECRET_KEY not set in environment")
    return Fernet(key.encode())


def encrypt_value(value: str) -> str:
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_value(token: str) -> str:
    return _get_fernet().decrypt(token.encode()).decode()


def _mask_name(name: str) -> str:
    parts = name.strip().split()
    initials = [p[0].upper() for p in parts if p]
    return ".".join(initials) + "." if initials else "***"


def _mask_tax_id(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    last4 = digits[-4:] if len(digits) >= 4 else digits
    return f"***-**-{last4}"


def _mask_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    last4 = digits[-4:] if len(digits) >= 4 else digits
    return f"***-***-{last4}"


def _mask_email(email: str) -> str:
    if "@" not in email:
        return "***@***.***"
    local, domain = email.split("@", 1)
    return f"{local[0]}***@{domain}" if local else f"***@{domain}"


def _mask_address(address: str) -> str:
    parts = address.split(",", 1)
    if len(parts) < 2:
        return "*** ****, " + address
    street, rest = parts
    words = street.strip().split()
    masked_street = "*** **** " + " ".join(words[2:]) if len(words) >= 2 else "*** ****"
    return f"{masked_street.strip()}, {rest.strip()}"


def mask_pii(data: dict) -> dict:
    masked = deepcopy(data)
    for key, value in data.items():
        if not isinstance(value, str):
            continue
        k = key.lower()
        if k == "owner_name":
            masked[key] = _mask_name(value)
        elif k in ("tax_id", "ssn", "ein"):
            masked[key] = _mask_tax_id(value)
        elif k == "address":
            masked[key] = _mask_address(value)
        elif k == "phone":
            masked[key] = _mask_phone(value)
        elif k == "email":
            masked[key] = _mask_email(value)
    masked["_pii_masked"] = True
    return masked
