# API Documentation

## Base URL

```
http://localhost:4000/api
```

## Authentication

All endpoints (except `/health`) require authentication via Bearer token:

```
Authorization: Bearer <token>
```

## Endpoints

### Health

#### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "SPV Platform API"
}
```

### SPVs

#### POST /spvs
Create a new SPV.

**Request:**
```json
{
  "name": "Tech Growth SPV",
  "type": "single_name",
  "fundraisingStart": "2024-01-01T00:00:00.000Z",
  "fundraisingEnd": "2024-03-31T23:59:59.999Z",
  "lifespanYears": 5,
  "managementFee": 2.0,
  "carryFee": 20.0,
  "targetAmount": 10000000
}
```

#### GET /spvs/:id
Get SPV details.

#### GET /spvs
List SPVs (with optional filters).

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by type

#### POST /spvs/:id/invite
Invite LPs to an SPV.

**Request:**
```json
{
  "emails": ["investor1@example.com", "investor2@example.com"]
}
```

### Subscriptions

#### POST /subscriptions
Create a subscription.

**Request:**
```json
{
  "spvId": "uuid",
  "amount": 100000,
  "walletAddress": "0x..."
}
```

#### POST /subscriptions/:id/fund
Submit funding details.

**Request:**
```json
{
  "wireReference": "WIRE123456",
  "bankName": "Bank Name",
  "accountNumber": "****1234"
}
```

### Investors

#### GET /investors/me
Get current investor profile.

#### GET /investors/me/tokens
Get token holdings.

#### GET /investors/me/distributions
Get distribution history.

### Admin

#### POST /admin/mint
Mint tokens (admin only).

**Request:**
```json
{
  "spvId": "uuid",
  "investorId": "uuid",
  "amount": "1000000000000000000"
}
```

#### POST /admin/nav
Update NAV (admin only).

**Request:**
```json
{
  "spvId": "uuid",
  "nav": "1500000000000000000"
}
```

### Real Estate

#### POST /real-estate/spvs/:spvId/drawdowns
Request a drawdown.

**Request:**
```json
{
  "amount": 500000,
  "milestone": "Foundation Complete",
  "documents": ["https://..."]
}
```

#### POST /real-estate/spvs/:spvId/milestones
Record a milestone.

**Request:**
```json
{
  "description": "Foundation Complete",
  "proof": "https://..."
}
```

