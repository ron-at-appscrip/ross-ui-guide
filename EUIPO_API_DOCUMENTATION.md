# EUIPO API Documentation

## Table of Contents
1. [Authentication](#authentication)
2. [Search Endpoint](#search-endpoint)
3. [Details Endpoint](#details-endpoint)
4. [Image Endpoints](#image-endpoints)
5. [Media Endpoints](#media-endpoints)
6. [Response Status Codes](#response-status-codes)

---

## Authentication

### OAuth 2.0 Client Credentials Flow

The EUIPO API uses OAuth 2.0 Client Credentials flow for authentication. You need to obtain an access token before making any API calls.

#### Token Endpoint
```
POST https://auth-sandbox.euipo.europa.eu/oidc/accessToken
```

#### Request Headers
```
Content-Type: application/x-www-form-urlencoded
```

#### Request Body Parameters
| Parameter | Value | Description |
|-----------|-------|-------------|
| `client_id` | `975ee0a15c09b958864a06a3c11c7edf` | Your client ID |
| `client_secret` | `1242715d3173f1e85ea44f16217a12fd` | Your client secret |
| `grant_type` | `client_credentials` | OAuth grant type |
| `scope` | `uid` | Required scope for trademark search |

#### cURL Example
```bash
curl -X POST https://auth-sandbox.euipo.europa.eu/oidc/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=975ee0a15c09b958864a06a3c11c7edf" \
  -d "client_secret=1242715d3173f1e85ea44f16217a12fd" \
  -d "grant_type=client_credentials" \
  -d "scope=uid"
```

#### Response
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIs...",
  "refresh_token": "RT-80115-TlU8j4hHCWVVhDyQ3P2X1sJt4h3fRDTt",
  "token_type": "bearer",
  "expires_in": 7200,
  "scope": "uid"
}
```

#### Token Usage
- **Token Type**: Bearer
- **Expiry**: 2 hours (7200 seconds)
- **Required Headers for API Calls**:
  - `Authorization: Bearer {access_token}`
  - `X-IBM-Client-Id: {client_id}`

---

## Search Endpoint

### Endpoint
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks
```

### Request Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `searchText` | string | No | Text to search for | `apple` |
| `page` | integer | No | Page number (0-indexed) | `0` |
| `size` | integer | No | Results per page (min: 10, max: 100) | `10` |
| `markFeature` | string | No | Filter by mark type | `WORD`, `FIGURATIVE` |
| `status` | string | No | Filter by status | `REGISTERED`, `EXPIRED` |
| `applicationNumber` | string | No | Search by application number | `000274084` |
| `query` | string | No | RSQL query for advanced filtering | `status==REGISTERED` |

### Request Headers
```
Authorization: Bearer {access_token}
X-IBM-Client-Id: {client_id}
```

### cURL Example - Basic Search
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks?page=0&size=10&searchText=apple" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf"
```

### cURL Example - Search by Application Number
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks?page=0&size=10&searchText=000274084" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf"
```

### cURL Example - Advanced Search with Filters
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks?page=0&size=10&markFeature=WORD&status=REGISTERED&query=niceClasses=in=(25,34)" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf"
```

### Response Structure
```json
{
  "trademarks": [
    {
      "applicationNumber": "000274084",
      "applicantReference": "86433/38994/AS",
      "markKind": "INDIVIDUAL",
      "markFeature": "FIGURATIVE",
      "markBasis": "EU_TRADEMARK",
      "niceClasses": [25, 34],
      "wordMarkSpecification": {
        "verbalElement": "RIZLA+ INTERNATIONAL"
      },
      "applicants": [
        {
          "office": "EM",
          "identifier": "191368",
          "name": "John Player & Sons Limited"
        }
      ],
      "representatives": [
        {
          "office": "EM",
          "identifier": "12100",
          "name": "STEVENS HEWLETT & PERKINS"
        }
      ],
      "applicationDate": "1996-06-19",
      "registrationDate": "1999-02-10",
      "expiryDate": "2006-06-19",
      "status": "EXPIRED"
    }
  ],
  "totalElements": 2354463,
  "totalPages": 235447,
  "size": 10,
  "page": 0
}
```

### Response Fields Description

| Field | Type | Description |
|-------|------|-------------|
| `trademarks` | array | Array of trademark objects |
| `totalElements` | integer | Total number of results found |
| `totalPages` | integer | Total number of pages available |
| `size` | integer | Number of results per page |
| `page` | integer | Current page number (0-indexed) |

#### Trademark Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `applicationNumber` | string | Unique EUIPO application number |
| `applicantReference` | string | Internal reference number |
| `markKind` | string | `INDIVIDUAL`, `COLLECTIVE`, `CERTIFICATION` |
| `markFeature` | string | `WORD`, `FIGURATIVE`, `3D`, `SOUND`, `COLOUR` |
| `markBasis` | string | Jurisdiction basis (usually `EU_TRADEMARK`) |
| `niceClasses` | array | Nice classification numbers |
| `wordMarkSpecification.verbalElement` | string | Text of the trademark |
| `applicants` | array | List of applicants |
| `representatives` | array | List of legal representatives |
| `applicationDate` | string | Filing date (YYYY-MM-DD) |
| `registrationDate` | string | Registration date if registered |
| `expiryDate` | string | Expiration date |
| `status` | string | `REGISTERED`, `EXPIRED`, `WITHDRAWN`, `PENDING` |

---

## Details Endpoint

### Endpoint
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}
```

### Path Parameters
| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `applicationNumber` | string | Yes | EUIPO application number | `000274084` |

### Request Headers
```
Authorization: Bearer {access_token}
X-IBM-Client-Id: {client_id}
Accept-Language: en  # Optional: Filter language for goods/services
```

### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/000274084" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf"
```

### Response Structure
```json
{
  "applicationNumber": "000274084",
  "applicantReference": "86433/38994/AS",
  "applicationLanguage": "nl",
  "secondLanguage": "en",
  "markKind": "INDIVIDUAL",
  "markFeature": "FIGURATIVE",
  "markBasis": "EU_TRADEMARK",
  "status": "EXPIRED",
  
  "wordMarkSpecification": {
    "verbalElement": "RIZLA+ INTERNATIONAL"
  },
  
  "markImage": {
    "imageFormat": "JPG",
    "viennaClasses": [
      "01.01.02",
      "01.01.10",
      "24.03.07",
      "24.17.07",
      "25.03.03"
    ]
  },
  
  "applicants": [
    {
      "office": "EM",
      "identifier": "191368",
      "name": "John Player & Sons Limited",
      "address": {
        "street": "...",
        "city": "...",
        "postalCode": "...",
        "country": "..."
      }
    }
  ],
  
  "representatives": [
    {
      "office": "EM",
      "identifier": "12100",
      "name": "STEVENS HEWLETT & PERKINS"
    }
  ],
  
  "applicationDate": "1996-06-19",
  "registrationDate": "1999-02-10",
  "expiryDate": "2006-06-19",
  "renewalDate": null,
  
  "goodsAndServices": [
    {
      "classNumber": 25,
      "description": [
        {
          "language": "en",
          "terms": [
            "Clothing, footwear, headgear",
            "T-shirts, shirts, pants"
          ]
        },
        {
          "language": "fr",
          "terms": [
            "Vêtements, chaussures, chapellerie"
          ]
        }
        // ... other languages
      ]
    }
  ]
}
```

### Additional Fields in Details Response

| Field | Type | Description |
|-------|------|-------------|
| `applicationLanguage` | string | Primary language code |
| `secondLanguage` | string | Secondary language code |
| `markImage` | object | Image details for figurative marks |
| `markSound` | object | Sound details for sound marks |
| `markVideo` | object | Video details for multimedia marks |
| `goodsAndServices` | array | Detailed goods/services in all EU languages |
| `viennaClasses` | array | Vienna classification codes for images |
| `renewalDate` | string | Last renewal date |

---

## Image Endpoints

### Get Full Image
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/image
```

#### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/000274084/image" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_image.jpg
```

#### Response
- **Content-Type**: `image/jpeg`
- **Body**: Binary image data

### Get Thumbnail Image
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/image/thumbnail
```

#### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/000274084/image/thumbnail" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_thumbnail.jpg
```

#### Response
- **Content-Type**: `image/jpeg`
- **Body**: Binary thumbnail image data (smaller size)

---

## Media Endpoints

### Get Sound (for sound marks)
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/sound
```

#### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/sound" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_sound.mp3
```

### Get Video (for multimedia marks)
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/video
```

#### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/video" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_video.mp4
```

### Get 3D Model (for 3D marks)
```
GET https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/model
```

#### cURL Example
```bash
TOKEN="your_access_token_here"
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/{applicationNumber}/model" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_model.obj
```

---

## Response Status Codes

### Success Codes
| Code | Description |
|------|-------------|
| `200` | Success - Request processed successfully |

### Error Codes
| Code | Description | Example Response |
|------|-------------|------------------|
| `400` | Bad Request - Invalid parameters | `{"type": "/problems/input-validation-error", "title": "Input validation error", "detail": "Page size must be greater than or equal to 10"}` |
| `401` | Unauthorized - Invalid or expired token | `{"type": "/problems/unauthorized", "title": "Unauthorized", "detail": "Cannot pass the security checks"}` |
| `404` | Not Found - Resource doesn't exist | `{"type": "/problems/not-found-error", "title": "Resource not found", "detail": "Sound for trademark with application number '000274084' not found"}` |
| `429` | Too Many Requests - Rate limit exceeded | `{"type": "/problems/too-many-requests", "title": "Too Many Requests", "detail": "Rate Limit exceeded"}` |
| `500` | Internal Server Error | `{"type": "/problems/general-error", "title": "General error", "status": 500}` |

---

## Complete Working Example

### Step 1: Get Access Token
```bash
# Get token and save to variable
TOKEN=$(curl -X POST https://auth-sandbox.euipo.europa.eu/oidc/accessToken \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=975ee0a15c09b958864a06a3c11c7edf" \
  -d "client_secret=1242715d3173f1e85ea44f16217a12fd" \
  -d "grant_type=client_credentials" \
  -d "scope=uid" \
  -s | jq -r '.access_token')
```

### Step 2: Search for Trademarks
```bash
# Search for trademarks
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks?page=0&size=10&searchText=000274084" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -s | jq '.'
```

### Step 3: Get Trademark Details
```bash
# Get detailed information
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/000274084" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -s | jq '.'
```

### Step 4: Download Trademark Image
```bash
# Download the trademark image
curl -X GET "https://api-sandbox.euipo.europa.eu/trademark-search/trademarks/000274084/image" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-IBM-Client-Id: 975ee0a15c09b958864a06a3c11c7edf" \
  -o trademark_000274084.jpg
```

---

## Test Application Numbers

Here are some valid application numbers for testing:

| Application Number | Name | Status | Nice Classes |
|-------------------|------|--------|--------------|
| `000274084` | RIZLA+ INTERNATIONAL | EXPIRED | 25, 34 |
| `000274324` | BARBIE FASHION DESIGNER | REGISTERED | 9, 28, 41 |
| `000274225` | JOHN G HARDY | REGISTERED | 25 |
| `000274878` | SINNERS | EXPIRED | 16, 25, 42 |
| `000274977` | ARAPHAT | WITHDRAWN | 18, 25, 28 |

---

## Rate Limiting

The API implements rate limiting. Check response headers for limit information:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Time when limit resets |
| `Retry-After` | Seconds to wait before retry (when rate limited) |

---

## Notes

1. **Sandbox Environment**: All examples use the sandbox environment
2. **Token Expiry**: Access tokens expire after 2 hours
3. **Minimum Page Size**: Search endpoint requires minimum size of 10
4. **Language Support**: Goods and services are available in all 24 official EU languages
5. **Media Availability**: Not all trademarks have images/sounds/videos - check mark type first

---

## Support

- **API Documentation**: https://dev-sandbox.euipo.europa.eu/
- **API Portal**: https://dev.euipo.europa.eu/
- **Support Email**: apiplatform@euipo.europa.eu