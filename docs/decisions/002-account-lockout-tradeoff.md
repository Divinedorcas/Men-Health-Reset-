# ADR-002: Account-Level Authentication Lockout Policy & Tradeoff

**Status:** Accepted  
**Date:** 2026-09-11  
**Decision Owner:** Engineering Team  
**Project:** Men's Health Reset OS  

---

## 1. Context & Background

Acceptance Criterion **AC-09** requires:
> 5 consecutive failed login attempts must trigger a rate-limit block (HTTP 429) for 5 minutes (300 seconds).

Initially, the throttle key was implemented by combining the user's email and client IP address (`login:{email}|{ip}`).

However, security review identified a critical flaw with IP-based throttling:
- An attacker with a candidate password list can rotate client IP addresses (via residential proxies, VPNs, or botnets).
- Because each new IP address generates a distinct RateLimiter bucket starting at zero, the account itself is never locked, allowing distributed brute-force and credential stuffing attacks to proceed indefinitely.

---

## 2. Decision

We key the rate-limit lockout strictly by the normalized account email:
```php
private function throttleKey(string $email): string
{
    return 'login:'.strtolower(trim($email));
}
```

Every failed login attempt against the specified email increments the account's failure count, regardless of the originating IP address. Once 5 consecutive failures occur within the decay window (300 seconds / 5 minutes), any subsequent login attempt is rejected with HTTP 429:
```json
{
  "message": "Too many attempts. Please try again in a few minutes."
}
```

---

## 3. Tradeoff Analysis

| Dimension | IP-Bound Throttling (`email + IP`) | Account-Bound Throttling (`email`) |
| :--- | :--- | :--- |
| **Brute-force protection** | Low (bypassed by rotating IP/proxies) | **High (account is locked regardless of source IP)** |
| **Credential stuffing** | Vulnerable across distributed IPs | **Protected (max 5 attempts per 5 minutes)** |
| **Denial of Service (DoS) risk** | Low against user, high against shared NAT | **Targeted DoS possibility against known email** |
| **Shared IP fairness (NAT/WiFi)** | One user's failures penalize neighbors | **No shared IP penalty; each account is independent** |

### Known Tradeoff & Denial of Service (DoS) Vector
By binding the lockout to the account email, an attacker who knows a user's email address could intentionally submit 5 incorrect passwords to temporarily lock that user out of the login endpoint for 5 minutes.

### Why This Tradeoff is Accepted for Sprint 01
1. **Prioritizing Credential Security**: Account compromise via password guessing is a higher-severity risk than a temporary 5-minute lockout.
2. **Active Sessions Unaffected**: Existing signed-in sessions (and active bearer tokens) remain completely functional; the lockout only throttles new authentication attempts.
3. **Short Decay Duration**: The lockout expires automatically after 5 minutes (300 seconds), rather than requiring administrative intervention or permanent account suspension.

---

## 4. Future Enhancements (Post-Sprint 01)

If targeted account lockouts become an observed issue in production, the following layered defenses can be introduced:
- **CAPTCHA / Turnstile**: Require CAPTCHA after 3 failures before locking the account.
- **Multi-Factor Authentication (MFA)**: Allow immediate sign-in via 2FA/TOTP or email magic link even when the password channel is throttled.
- **Dual-Bucket Hybrid Throttling**: Progressive exponential delays per IP alongside account-level velocity monitoring.
