# Vigilo Privacy Architecture & Child Protection Standards

Vigilo was engineered with a non-negotiable principle:
**Child safety does NOT require invasive surveillance.**

Most parental monitoring applications record every keystroke, capture full browsing histories, and log private family chats. Vigilo rejects this model completely.

---

## 1. What Vigilo Stores vs. What Vigilo Never Stores

| Dimension | Vigilo Stored Data | What Vigilo NEVER Stores |
| :--- | :--- | :--- |
| **Browsing Activity** | Aggregated category counters only (`gaming_scams: 4`, `phishing: 2`) | Full URLs of benign sites, search queries, visit durations, browsing logs |
| **Form Inputs & Passwords** | Boolean presence flag only (`has_password_field = True`) | Password values, email inputs, form text, or personal credentials |
| **Webpage Text** | Truncated public markup snippets evaluated in memory | Private messages, user profiles, or complete page DOM clones |
| **Incidents & Forensics** | High-risk incident metadata, indicators, timestamp, and actions | Private child browsing context or innocuous exploratory visits |
| **AI Transmission** | Only threat classification vectors and public scam phrases | Personal names, child emails, passwords, or device identifiers |

---

## 2. Privacy-Preserving Adaptive Protection

Instead of maintaining a timeline of every site a child accesses, Vigilo uses an anonymized threat profile:

```json
{
  "gaming_scams": 8,
  "phishing": 3,
  "malicious_downloads": 1,
  "fake_logins": 2,
  "suspicious_content": 0
}
```

- When the `gaming_scams` counter rises, the system dynamically lowers the warning threshold for gaming-related indicators (e.g. from 70 to 55).
- Parents see threat trends on their dashboard without spying on their child's normal learning, hobbies, or curiosities.

---

## 3. Client-Side Sanitization

Before webpage text is sent to the backend for heuristic scoring:
1. The DOM clone strips all `<form>`, `<input>`, `<textarea>`, `<script>`, and `<style>` tags.
2. Only visible public text (up to 1,500 characters) is reviewed for scam keywords (e.g., "Congratulations! You won 10,000 Free Coins").
3. Input values typed into form fields are never read or stored.

---

## 4. Compliance with Child Online Privacy Standards

- **COPPA / GDPR-K Alignment**: No personal information is gathered or shared with third-party advertising networks.
- **Local Storage Isolation**: Evidence packs and incident records remain within family storage and local database boundaries.
