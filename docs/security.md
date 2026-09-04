# VulnForge Security & Isolation Rules

VulnForge is intentionally insecure at the **application layer**. It still needs strong **lab isolation**.

## Core Rule

> The vulnerable application may be weak; the environment around it must be controlled.

## Allowed Environment

Recommended:

```text
localhost
private development VM
isolated Docker network
```

## Prohibited Targets

Never use VulnForge to target:

- production systems
- real customer data
- real credentials
- third-party applications
- cloud metadata services
- unrelated private networks
- public internet hosts

## Synthetic Data

Use values such as:

```text
VF_LAB_USER_001
VF_LAB_ORDER_1001
VF_LAB_SECRET_001
TRAINING_TOKEN_ABC
```

Do not place personal or production information in seed data.

## Secrets

Never commit:

```text
.env
production API keys
real passwords
private certificates
cloud credentials
```

Commit only `.env.example`.

## Vulnerability Boundary

Use:

```text
/api/lab/*
```

for deliberate exploit scenarios where practical.

Every lab should have documentation explaining its intended weakness.

## SSRF Safety

The SSRF module is allowed to connect only to explicitly controlled local training services.

Do not allow:

```text
0.0.0.0
127.0.0.1 unrestricted arbitrary ports
cloud metadata IPs
arbitrary DNS destinations
public internet
host filesystem URLs
```

Use an explicit allow-list of lab service names/URLs.

## File Upload Safety

File upload exercises should use a dedicated lab storage directory.

Do not store uploads inside executable source directories.

Do not configure unrestricted execution of uploaded content.

## Database Safety

The lab database is disposable.

Provide deterministic reset/seed behavior.

Use a separate database file/instance from any personal or production database.

## Logging

Never log:

- passwords
- session secrets
- private keys
- authorization tokens

Log only what is needed for debugging and mission/audit purposes.

## Public Hosting

Do not publish the intentionally vulnerable application directly to the public internet.

If the project is later distributed publicly, distribute source/configuration and explain how to run it locally rather than exposing a live vulnerable service.
