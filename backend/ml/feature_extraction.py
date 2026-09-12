"""
Vigilo ML Feature Extraction Engine
Extracts numerical and categorical features from URLs, domains, and webpage content
for child-safety threat classification and risk scoring.
"""

import re
import urllib.parse
from typing import Dict, Any, List

SUSPICIOUS_TLDS = {
    ".xyz", ".top", ".tk", ".ml", ".ga", ".cf", ".gq", ".click", ".buzz", ".club",
    ".work", ".date", ".racing", ".bid", ".loan", ".stream", ".download", ".zip", ".mov"
}

SCAM_KEYWORDS = [
    "free", "coins", "robux", "vbucks", "gift", "giveaway", "claim", "winner", "prize",
    "unlimited", "generator", "cheat", "hack", "bypass", "steamcommunity", "discord-nitro",
    "login", "signin", "password", "verify", "account", "security", "update", "bank",
    "urgent", "suspended", "warning", "confirm"
]

URGENCY_PHRASES = [
    "act now", "limited time", "immediate action required", "account will be deleted",
    "account suspended", "don't miss out", "congratulations you won", "claim within",
    "enter your password", "confirm your identity", "verify your credentials"
]

FEATURE_NAMES = [
    "url_length",
    "domain_length",
    "num_dots",
    "num_hyphens",
    "num_underscores",
    "num_slash",
    "num_digits",
    "num_special_chars",
    "num_subdomains",
    "is_ip_address",
    "is_https",
    "has_suspicious_tld",
    "num_url_params",
    "scam_keyword_count",
    "has_password_field",
    "has_urgency_text"
]

def extract_features(url: str, page_content: str = "", has_password_field: bool = False) -> Dict[str, Any]:
    """
    Extracts structured features from URL and optional page content.
    Returns both a feature dictionary and vector suitable for ML prediction.
    """
    url_str = (url or "").strip()
    parsed = urllib.parse.urlparse(url_str)
    
    # Normalize scheme
    is_https = 1 if parsed.scheme.lower() == "https" else 0
    netloc = parsed.netloc.lower()
    
    # Strip port if present
    domain = netloc.split(":")[0] if ":" in netloc else netloc
    
    # URL Length & domain length
    url_length = len(url_str)
    domain_length = len(domain)
    
    # Punctuation counts
    num_dots = url_str.count(".")
    num_hyphens = url_str.count("-")
    num_underscores = url_str.count("_")
    num_slash = url_str.count("/")
    num_digits = sum(c.isdigit() for c in url_str)
    num_special_chars = len(re.findall(r"[@?!&=%#+*$~]", url_str))
    
    # Subdomain count
    domain_parts = domain.split(".")
    num_subdomains = max(0, len(domain_parts) - 2) if len(domain_parts) >= 2 else 0
    
    # IP Address detection
    ip_pattern = r"^(\d{1,3}\.){3}\d{1,3}$"
    is_ip_address = 1 if re.match(ip_pattern, domain) else 0
    
    # Suspicious TLD detection
    has_suspicious_tld = 0
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            has_suspicious_tld = 1
            break
            
    # URL Query parameters
    params = urllib.parse.parse_qs(parsed.query)
    num_url_params = len(params)
    
    # Scam keyword count in URL
    url_lower = url_str.lower()
    scam_keyword_count = sum(1 for kw in SCAM_KEYWORDS if kw in url_lower)
    
    # Page text urgency analysis
    page_text_lower = (page_content or "").lower()
    has_urgency = 1 if any(phrase in page_text_lower for phrase in URGENCY_PHRASES) else 0
    has_pwd = 1 if (has_password_field or 'type="password"' in page_text_lower or "password" in page_text_lower) else 0
    
    features = {
        "url_length": url_length,
        "domain_length": domain_length,
        "num_dots": num_dots,
        "num_hyphens": num_hyphens,
        "num_underscores": num_underscores,
        "num_slash": num_slash,
        "num_digits": num_digits,
        "num_special_chars": num_special_chars,
        "num_subdomains": num_subdomains,
        "is_ip_address": is_ip_address,
        "is_https": is_https,
        "has_suspicious_tld": has_suspicious_tld,
        "num_url_params": num_url_params,
        "scam_keyword_count": scam_keyword_count,
        "has_password_field": has_pwd,
        "has_urgency_text": has_urgency
    }
    
    # Detected human-readable indicators
    detected_indicators = []
    if is_ip_address:
        detected_indicators.append("Host is raw IP address instead of registered domain")
    if has_suspicious_tld:
        detected_indicators.append("High-risk or disposable top-level domain (.xyz, .top, .click)")
    if scam_keyword_count >= 2:
        detected_indicators.append(f"Contains {scam_keyword_count} bait/scam keywords in URL")
    if not is_https:
        detected_indicators.append("Insecure HTTP connection (no SSL encryption)")
    if num_subdomains >= 2:
        detected_indicators.append(f"Multiple subdomains ({num_subdomains}) often used in deceptive domain spoofing")
    if has_pwd and scam_keyword_count >= 1:
        detected_indicators.append("Password field detected alongside bait/reward keywords (Credential Harvester)")
    if has_urgency:
        detected_indicators.append("Urgency or pressure tactics detected in webpage text")
    if num_hyphens >= 3:
        detected_indicators.append("Deceptive hyphenation in domain often used for brand impersonation")

    return {
        "features": features,
        "vector": [features[name] for name in FEATURE_NAMES],
        "feature_names": FEATURE_NAMES,
        "detected_indicators": detected_indicators,
        "domain": domain
    }
