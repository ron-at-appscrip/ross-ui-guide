# Development Server Information

## 🚀 Server Status: RUNNING

The development server is running successfully on:

### Local Access:
- **HTTP**: http://localhost:8080/
- **Network**: http://192.168.1.68:8080/

### ⚠️ Important Notes:

1. **Use HTTP, not HTTPS**: The development server runs on HTTP protocol only
   - ✅ Correct: `http://localhost:8080`
   - ❌ Wrong: `https://localhost:8080`

2. **If you see ERR_SSL_PROTOCOL_ERROR**:
   - You're trying to access via HTTPS
   - Change the URL to start with `http://` not `https://`

3. **Session Tracking Features**:
   - Session ID: Extracted from JWT tokens
   - IP Address: Detected via external API
   - Session History: Available in user profile
   - Active Sessions: Shows current connections

### Starting the Server:
```bash
npm run dev
```

### Checking Server Status:
```bash
curl http://localhost:8080/
```

### Build Commands:
```bash
npm run build        # Production build
npm run lint         # Check code quality
npx tsc --noEmit    # TypeScript check
```