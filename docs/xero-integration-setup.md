# Xero Integration Setup Guide

## Overview
Ross AI integrates with Xero to synchronize client data, invoices, and payments between your legal practice management system and Xero accounting software.

## Prerequisites
1. A Xero account with appropriate permissions
2. Access to the Xero Developer Portal
3. Ross AI running on `http://localhost:8080`

## Setup Instructions

### 1. Create a Xero App
1. Sign up or log in at [https://developer.xero.com/](https://developer.xero.com/)
2. Go to "My Apps" and click "New App"
3. Fill in the app details:
   - **App name**: Ross AI Integration (or your preferred name)
   - **Company or application URL**: http://localhost:8080
   - **OAuth 2.0 redirect URI**: `http://localhost:8080/auth/xero/callback`
   - Accept the terms and conditions

### 2. Get Your API Credentials
1. After creating the app, you'll see your credentials:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (keep it secure!)

### 3. Configure Ross AI
1. Copy `.env.example` to `.env` if you haven't already
2. Add your Xero credentials:
   ```env
   VITE_XERO_CLIENT_ID=your_client_id_here
   VITE_XERO_CLIENT_SECRET=your_client_secret_here
   VITE_XERO_REDIRECT_URI=http://localhost:8080/auth/xero/callback
   ```
3. Restart your development server for the changes to take effect

### 4. Connect to Xero
1. Navigate to **Billing** → **Integrations** tab in Ross AI
2. Enter your Client ID and Client Secret
3. Click "Connect to Xero"
4. You'll be redirected to Xero to authorize the connection
5. Select your Xero organization and grant permissions
6. You'll be redirected back to Ross AI with a success message

## Features

### Data Synchronization
- **Clients → Contacts**: Sync Ross AI clients to Xero contacts
- **Invoices**: Create Xero invoices from Ross AI billing data
- **Payments**: Track payment status and sync payment records

### Settings
- **Auto-sync**: Enable automatic synchronization at regular intervals
- **Sync Frequency**: Choose between hourly, daily, or weekly sync
- **Default Currency**: Set your preferred currency for transactions

### Security Notes
- Never commit your `.env` file with real credentials
- Client Secret should be kept secure and not shared
- OAuth tokens are stored in browser localStorage (consider secure storage for production)

## Troubleshooting

### Connection Issues
- Ensure your redirect URI matches exactly: `http://localhost:8080/auth/xero/callback`
- Check that your app is running on port 8080
- Verify your Client ID and Secret are correct

### Sync Errors
- Check the sync history tab for detailed error messages
- Ensure you have the required permissions in Xero
- Verify that client names match between systems for proper mapping

## Production Deployment
For production deployment, you'll need to:
1. Update the redirect URI to your production domain
2. Store credentials securely (not in environment variables)
3. Implement secure token storage (not localStorage)
4. Set up webhook endpoints for real-time updates
5. Configure rate limiting for API calls

## Support
For issues specific to:
- Xero API: Visit [Xero Developer Documentation](https://developer.xero.com/documentation/)
- Ross AI Integration: Contact your system administrator