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
    "urgent", "suspended", "warning", "confirm", "download", "installer", "slot", "bonus",
    "reward", "unlock", "limited time", "act now", "verify now", "suspicious"
]

URGENCY_PHRASES = [
    "act now", "limited time", "immediate action required", "account will be deleted",
    "account suspended", "don't miss out", "congratulations you won", "claim within",
    "enter your password", "confirm your identity", "verify your credentials", "expires in",
    "immediately", "permanently deleted", "verify now", "security alert"
]

TRUSTED_PAGE_HINTS = [
    "gmail", "outlook", "microsoft", "google", "login", "inbox", "compose", "mail",
    "official", "secure", "account", "support", "workspace", "drive", "calendar"
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
    "urgency_phrase_count",
    "password_keyword_count",
    "reward_keyword_count",
    "page_text_length",
    "has_password_field",
    "has_urgency_text",
    "has_trusted_brand_hint",
    "has_phishing_action_text"
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
    
    # Scam keyword count in URL and page text
    url_lower = url_str.lower()
    scam_keyword_count = sum(1 for kw in SCAM_KEYWORDS if kw in url_lower)
    page_text_lower = (page_content or "").lower()
    urgency_phrase_count = sum(1 for phrase in URGENCY_PHRASES if phrase in page_text_lower)
    password_keyword_count = sum(1 for kw in ["password", "passcode", "verify", "login", "signin", "confirm account"] if kw in page_text_lower)
    reward_keyword_count = sum(1 for kw in ["free", "claim", "reward", "bonus", "prize", "winner", "gift", "coins", "robux", "vbucks"] if kw in page_text_lower)
    page_text_length = len(page_text_lower)

    has_urgency = 1 if urgency_phrase_count > 0 else 0
    has_pwd = 1 if (has_password_field or 'type="password"' in page_text_lower or "password" in page_text_lower or password_keyword_count > 0) else 0
    has_trusted_brand_hint = 1 if any(brand in page_text_lower or brand in url_lower for brand in ["gmail", "outlook", "microsoft", "google", "roblox", "minecraft", "steam", "official"]) else 0
    has_phishing_action_text = 1 if any(term in page_text_lower for term in ["verify now", "account suspended", "immediate action required", "click here", "security alert", "confirm your identity"]) else 0

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
        "urgency_phrase_count": urgency_phrase_count,
        "password_keyword_count": password_keyword_count,
        "reward_keyword_count": reward_keyword_count,
        "page_text_length": page_text_length,
        "has_password_field": has_pwd,
        "has_urgency_text": has_urgency,
        "has_trusted_brand_hint": has_trusted_brand_hint,
        "has_phishing_action_text": has_phishing_action_text
    }

    # Detected human-readable indicators
    detected_indicators = []
    if is_ip_address:
        detected_indicators.append("Host is raw IP address instead of registered domain")
    if has_suspicious_tld:
        detected_indicators.append("High-risk or disposable top-level domain (.xyz, .top, .click)")
    if scam_keyword_count >= 2:
        detected_indicators.append(f"Contains {scam_keyword_count} bait/scam keywords in URL")
    if reward_keyword_count >= 2:
        detected_indicators.append("Reward or free-offer language detected in page text")
    if not is_https:
        detected_indicators.append("Insecure HTTP connection (no SSL encryption)")
    if num_subdomains >= 2:
        detected_indicators.append(f"Multiple subdomains ({num_subdomains}) often used in deceptive domain spoofing")
    if has_pwd and (scam_keyword_count >= 1 or reward_keyword_count >= 1):
        detected_indicators.append("Password field detected alongside bait or urgency text (Credential Harvester)")
    if has_urgency:
        detected_indicators.append(f"Urgency or pressure tactics detected in webpage text ({urgency_phrase_count} phrases)")
    if num_hyphens >= 3:
        detected_indicators.append("Deceptive hyphenation in domain often used for brand impersonation")
    if page_text_length > 250 and has_phishing_action_text:
        detected_indicators.append("Phishing action language such as 'verify now' or 'account suspended' was detected")
    if has_trusted_brand_hint and not has_phishing_action_text and not has_pwd:
        detected_indicators.append("Page appears to belong to a real service and does not show malicious prompt patterns")

    return {
        "features": features,
        "vector": [features[name] for name in FEATURE_NAMES],
        "feature_names": FEATURE_NAMES,
        "detected_indicators": detected_indicators,
        "domain": domain
    }
