# Security Checklist

Before submission, verify:
- authn/authz boundaries
- no exposed secrets
- input validation and output encoding
- prompt-injection handling where applicable
- SSRF/file upload safeguards where applicable
- rate limiting for abuse-prone endpoints
- safe error handling without sensitive leakage
