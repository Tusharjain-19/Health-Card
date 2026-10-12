# HealthCard — Admin & Card Issuer Portal

> Independent deployment for Issuer Admins, Verification Officers, and Compliance Auditors.

## Key Sub-Routes
- `/login`: Single-factor + MFA corporate authentication
- `/dashboard`: Executive metrics, KPI cards, pending queues, and live activity stream
- `/applications`: Citizen KYC submissions (`pending`, `under-review`, `corrections`, `approved`, `rejected`)
- `/verification`: Identity verification workflows (`documents`, `face`, `biometric`, `manual-review`)
- `/members`: 10-digit Health ID citizen directory & profile inspection
- `/cards`: Physical CR80 PVC card issuing wizard (`issue`, `active`, `blocked`, `replacement`, `history`)
- `/printing`: Batch card printer queues (`queue`, `printed`, `failed`)
- `/orders`: Courier fulfillment and dispatch logistics
- `/organizations`: Verified hospitals, clinics, and diagnostic labs (`hospitals`, `laboratories`, `clinics`)
- `/staff`: Healthcare worker role and credential management
- `/audit`: Immutable audit trail and security anomaly alerts
