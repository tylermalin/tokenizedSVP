# KYC/AML Integration Setup Guide

## Overview

The SPV Platform uses **Sumsub** for KYC/AML verification. Sumsub provides comprehensive identity verification, document checks, and AML screening.

## Sumsub Account Setup

1. **Create Account**
   - Sign up at https://sumsub.com
   - Complete onboarding process
   - Choose appropriate plan (Sandbox available for testing)

2. **Get Credentials**
   - Navigate to Settings → API
   - Copy your `App Token` and `Secret Key`
   - Note your API base URL (usually `https://api.sumsub.com`)

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/compliance/webhook/sumsub`
   - Select events:
     - `applicantReviewed` - When KYC review is completed
     - `applicantStatusChanged` - When status changes
   - Save webhook secret for signature verification

## Environment Variables

Add to your `.env` file:

```env
# Sumsub Configuration
SUMSUB_APP_TOKEN=your-app-token-here
SUMSUB_SECRET_KEY=your-secret-key-here
SUMSUB_BASE_URL=https://api.sumsub.com
```

## Database Migration

Run the migration to add the `sumsubApplicantId` field:

```bash
cd backend
npx prisma migrate dev --name add_sumsub_applicant_id
npx prisma generate
```

## API Endpoints

### Initiate KYC
```
POST /api/compliance/kyc/initiate
Authorization: Bearer <token>
```

**Response:**
```json
{
  "investorId": "uuid",
  "applicantId": "sumsub-applicant-id",
  "sdkToken": "sdk-access-token",
  "kycStatus": "pending",
  "verificationUrl": "https://sumsub.com/idensic/l/#/access/..."
}
```

### Get KYC Status
```
GET /api/compliance/kyc/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "investorId": "uuid",
  "kycStatus": "verified",
  "reviewStatus": "completed",
  "reviewResult": "green",
  "verifiedAt": "2024-01-01T00:00:00.000Z"
}
```

### Webhook Endpoint
```
POST /api/compliance/webhook/sumsub
X-Sumsub-Signature: <signature>
```

## Integration Flow

1. **Investor Registration**
   - Investor creates account
   - Investor profile is created

2. **Subscription Initiation**
   - When investor subscribes to an SPV, KYC is automatically initiated
   - Sumsub applicant is created
   - SDK token is generated for frontend

3. **Frontend Verification**
   - Investor clicks "Complete Verification"
   - Redirected to Sumsub verification flow
   - Completes identity verification (ID document, selfie, etc.)

4. **Webhook Processing**
   - Sumsub sends webhook when review completes
   - Backend verifies signature
   - Updates investor KYC/AML status
   - Notifies investor (optional)

5. **Compliance Check**
   - Before token minting, system checks compliance
   - Only compliant investors receive tokens

## Frontend Integration

The frontend includes a `KYCVerification` component that:
- Shows current KYC/AML status
- Initiates verification flow
- Provides verification link
- Displays verification status

## Testing

### Sandbox Mode
Sumsub provides a sandbox environment for testing:
- Use sandbox credentials
- Test with sample documents
- Verify webhook handling

### Test Scenarios
1. **Successful Verification**
   - Complete KYC flow
   - Verify status updates to "verified"
   - Check AML status updates to "cleared"

2. **Rejected Verification**
   - Submit invalid documents
   - Verify status updates to "rejected"
   - Check error handling

3. **Webhook Handling**
   - Send test webhook from Sumsub dashboard
   - Verify signature validation
   - Check status updates

## Security Considerations

1. **Webhook Signature Verification**
   - Always verify webhook signatures
   - Use `SUMSUB_SECRET_KEY` for verification
   - Reject unsigned or invalid signatures

2. **Token Security**
   - SDK tokens expire after 10 minutes
   - Regenerate tokens as needed
   - Don't expose secret keys in frontend

3. **Data Privacy**
   - Store only necessary Sumsub data
   - Comply with GDPR/privacy regulations
   - Secure PII data

## Troubleshooting

### Common Issues

1. **"Invalid signature" error**
   - Verify `SUMSUB_SECRET_KEY` is correct
   - Check webhook payload format
   - Ensure signature header is present

2. **"Applicant not found"**
   - Verify `sumsubApplicantId` is stored correctly
   - Check database migration ran successfully
   - Verify applicant creation succeeded

3. **SDK token generation fails**
   - Check `SUMSUB_APP_TOKEN` is correct
   - Verify API base URL
   - Check network connectivity

## Alternative Providers

To switch to a different KYC/AML provider:

1. Create new service class (e.g., `OnfidoService.ts`)
2. Implement same interface methods
3. Update `ComplianceService` to use new provider
4. Update environment variables
5. Update frontend components if needed

## Support

- Sumsub Documentation: https://developers.sumsub.com/
- Sumsub Support: support@sumsub.com
- API Reference: https://developers.sumsub.com/api-reference/

