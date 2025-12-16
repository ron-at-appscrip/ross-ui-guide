# Client Search & Filtering API

## 📋 Overview

The Client Search & Filtering API provides advanced search capabilities for finding clients based on multiple criteria. This module implements full-text search, advanced filtering, sorting, and pagination to help legal professionals quickly locate specific clients within large datasets.

## 🎯 Core Features

- **Full-Text Search**: Search across client names, emails, phones, and notes
- **Advanced Filtering**: Filter by status, type, industry, tags, and custom criteria
- **Multi-Field Sorting**: Sort by any client field with ascending/descending order
- **Intelligent Pagination**: Efficient pagination with performance optimization
- **Elasticsearch Integration**: Optional full-text search engine support
- **Faceted Search**: Aggregate filtering options with result counts
- **Export Capabilities**: Export filtered results in multiple formats
- **Saved Searches**: Save and reuse complex search queries

## 🔍 Search Endpoints

### 1. Advanced Client Search

**GET** `/api/v1/clients/search`

Performs advanced search across all client data with comprehensive filtering options.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | - | Search query (searches name, email, phone, notes) |
| `status` | string[] | - | Filter by client status (active, inactive, prospect) |
| `type` | string[] | - | Filter by client type (person, company) |
| `industry` | string[] | - | Filter by industry |
| `tags` | string[] | - | Filter by tags (comma-separated) |
| `city` | string[] | - | Filter by city |
| `state` | string[] | - | Filter by state |
| `country` | string[] | - | Filter by country |
| `created_after` | string | - | Filter clients created after date (ISO 8601) |
| `created_before` | string | - | Filter clients created before date (ISO 8601) |
| `last_activity_after` | string | - | Filter by last activity after date |
| `last_activity_before` | string | - | Filter by last activity before date |
| `has_matters` | boolean | - | Filter clients with/without matters |
| `total_billed_min` | number | - | Minimum total billed amount |
| `total_billed_max` | number | - | Maximum total billed amount |
| `responsible_attorney` | string[] | - | Filter by responsible attorney IDs |
| `page` | integer | 1 | Page number (1-based) |
| `per_page` | integer | 20 | Results per page (max 100) |
| `sort_by` | string | name | Sort field (name, created_at, last_activity, total_billed) |
| `sort_order` | string | asc | Sort direction (asc, desc) |
| `include_facets` | boolean | false | Include filter facets in response |
| `include_highlights` | boolean | false | Include search term highlights |

#### Request Example

```bash
curl -X GET "/api/v1/clients/search?q=Smith&status=active&type=person&industry=Technology&sort_by=last_activity&sort_order=desc&include_facets=true" \
  -H "Authorization: Bearer {jwt_token}"
```

#### Response Schema

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Smith",
      "type": "person",
      "status": "active",
      "industry": "Technology",
      "primary_contact": "John Smith",
      "emails": [
        {
          "id": "e1",
          "value": "john.smith@techcorp.com",
          "type": "work",
          "is_primary": true
        }
      ],
      "phones": [
        {
          "id": "p1", 
          "value": "+1-555-123-4567",
          "type": "work",
          "is_primary": true
        }
      ],
      "addresses": [
        {
          "id": "a1",
          "street": "123 Corporate Blvd",
          "city": "New York",
          "state": "NY",
          "zip_code": "10001",
          "country": "US",
          "type": "work",
          "is_primary": true
        }
      ],
      "person_details": {
        "first_name": "John",
        "last_name": "Smith",
        "title": "CEO",
        "company": "TechCorp Inc."
      },
      "profile_photo_url": "https://storage.example.com/photo.jpg",
      "tags": ["VIP", "Corporate Law"],
      "total_matters": 5,
      "active_matters": 2,
      "total_billed": 125000.00,
      "outstanding_balance": 15000.00,
      "last_activity": "2024-12-06T15:30:00Z",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-12-06T15:30:00Z",
      "_highlights": {
        "name": ["John <mark>Smith</mark>"],
        "emails": ["john.<mark>smith</mark>@techcorp.com"]
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false,
    "search_time_ms": 45
  },
  "facets": {
    "status": {
      "active": 450,
      "inactive": 75,
      "prospect": 125
    },
    "type": {
      "person": 380,
      "company": 270
    },
    "industry": {
      "Technology": 120,
      "Healthcare": 95,
      "Finance": 85,
      "Real Estate": 70
    },
    "cities": {
      "New York": 180,
      "Los Angeles": 95,
      "Chicago": 75
    }
  },
  "links": {
    "first": "/api/v1/clients/search?page=1&per_page=20",
    "last": "/api/v1/clients/search?page=1&per_page=20",
    "next": null,
    "prev": null
  }
}
```

#### Implementation

```python
@router.get("/clients/search", response_model=ClientSearchResponse)
@require_permission(Permission.CLIENTS_READ)
async def search_clients(
    # Search parameters
    q: Optional[str] = None,
    status: Optional[List[str]] = Query(None),
    type: Optional[List[str]] = Query(None),
    industry: Optional[List[str]] = Query(None),
    tags: Optional[List[str]] = Query(None),
    city: Optional[List[str]] = Query(None),
    state: Optional[List[str]] = Query(None),
    country: Optional[List[str]] = Query(None),
    
    # Date filters
    created_after: Optional[datetime] = None,
    created_before: Optional[datetime] = None,
    last_activity_after: Optional[datetime] = None,
    last_activity_before: Optional[datetime] = None,
    
    # Business logic filters
    has_matters: Optional[bool] = None,
    total_billed_min: Optional[float] = None,
    total_billed_max: Optional[float] = None,
    responsible_attorney: Optional[List[str]] = Query(None),
    
    # Pagination and sorting
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    sort_by: str = Query("name", regex="^(name|created_at|last_activity|total_billed)$"),
    sort_order: str = Query("asc", regex="^(asc|desc)$"),
    
    # Response options
    include_facets: bool = False,
    include_highlights: bool = False,
    
    # Dependencies
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    redis: Redis = Depends(get_redis)
):
    search_params = ClientSearchParams(
        query=q,
        status=status,
        type=type,
        industry=industry,
        tags=tags,
        city=city,
        state=state,
        country=country,
        created_after=created_after,
        created_before=created_before,
        last_activity_after=last_activity_after,
        last_activity_before=last_activity_before,
        has_matters=has_matters,
        total_billed_min=total_billed_min,
        total_billed_max=total_billed_max,
        responsible_attorney=responsible_attorney,
        page=page,
        per_page=per_page,
        sort_by=sort_by,
        sort_order=sort_order,
        include_facets=include_facets,
        include_highlights=include_highlights
    )
    
    # Generate cache key for this search
    cache_key = f"client_search:{current_user.organization_id}:{hash(search_params.dict())}"
    
    # Try cache first
    cached_result = await redis.get(cache_key)
    if cached_result:
        return ClientSearchResponse.parse_raw(cached_result)
    
    # Perform search
    start_time = time.time()
    
    if q and len(q) > 2:  # Use full-text search for queries
        search_result = await client_search_service.full_text_search(
            db, search_params, current_user.organization_id
        )
    else:  # Use database filtering for simple filters
        search_result = await client_search_service.filter_search(
            db, search_params, current_user.organization_id
        )
    
    search_time_ms = int((time.time() - start_time) * 1000)
    
    # Build response
    response = ClientSearchResponse(
        data=search_result.clients,
        meta=SearchMeta(
            total=search_result.total,
            page=page,
            per_page=per_page,
            total_pages=math.ceil(search_result.total / per_page),
            has_next=page * per_page < search_result.total,
            has_prev=page > 1,
            search_time_ms=search_time_ms
        ),
        facets=search_result.facets if include_facets else None,
        links=build_pagination_links(search_params, search_result.total)
    )
    
    # Cache result for 5 minutes
    await redis.setex(cache_key, 300, response.json())
    
    return response
```

### 2. Quick Search

**GET** `/api/v1/clients/quick-search`

Simplified search endpoint for real-time search-as-you-type functionality.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `limit` | integer | No | Maximum results (default 10, max 25) |
| `fields` | string[] | No | Fields to include in response |

#### Response Example

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Smith",
      "type": "person",
      "status": "active",
      "primary_email": "john.smith@techcorp.com",
      "primary_phone": "+1-555-123-4567",
      "profile_photo_url": "https://storage.example.com/photo.jpg"
    }
  ],
  "meta": {
    "total": 1,
    "search_time_ms": 12
  }
}
```

### 3. Filter Options

**GET** `/api/v1/clients/filter-options`

Retrieves available filter options with counts for building dynamic search UIs.

#### Response Example

```json
{
  "data": {
    "status": [
      {"value": "active", "label": "Active", "count": 450},
      {"value": "inactive", "label": "Inactive", "count": 75},
      {"value": "prospect", "label": "Prospect", "count": 125}
    ],
    "type": [
      {"value": "person", "label": "Individual", "count": 380},
      {"value": "company", "label": "Company", "count": 270}
    ],
    "industries": [
      {"value": "Technology", "label": "Technology", "count": 120},
      {"value": "Healthcare", "label": "Healthcare", "count": 95},
      {"value": "Finance", "label": "Finance", "count": 85}
    ],
    "tags": [
      {"value": "VIP", "label": "VIP", "count": 45},
      {"value": "Corporate Law", "label": "Corporate Law", "count": 125}
    ],
    "cities": [
      {"value": "New York", "label": "New York", "count": 180},
      {"value": "Los Angeles", "label": "Los Angeles", "count": 95}
    ],
    "states": [
      {"value": "NY", "label": "New York", "count": 180},
      {"value": "CA", "label": "California", "count": 145}
    ]
  }
}
```

## 💾 Saved Searches

### 4. Save Search Query

**POST** `/api/v1/clients/saved-searches`

Saves a search query for future use.

#### Request Body

```json
{
  "name": "Active Technology Clients",
  "description": "All active clients in the technology industry",
  "search_params": {
    "status": ["active"],
    "industry": ["Technology"],
    "sort_by": "last_activity",
    "sort_order": "desc"
  },
  "is_public": false
}
```

#### Response

```json
{
  "data": {
    "id": "search_123",
    "name": "Active Technology Clients",
    "description": "All active clients in the technology industry",
    "search_params": {
      "status": ["active"],
      "industry": ["Technology"],
      "sort_by": "last_activity",
      "sort_order": "desc"
    },
    "is_public": false,
    "created_by": "user_456",
    "created_at": "2024-12-07T10:30:00Z",
    "use_count": 0
  }
}
```

### 5. List Saved Searches

**GET** `/api/v1/clients/saved-searches`

Retrieves all saved searches for the current user.

#### Response

```json
{
  "data": [
    {
      "id": "search_123",
      "name": "Active Technology Clients",
      "description": "All active clients in the technology industry",
      "is_public": false,
      "created_at": "2024-12-07T10:30:00Z",
      "use_count": 15,
      "last_used": "2024-12-06T14:20:00Z"
    }
  ]
}
```

### 6. Execute Saved Search

**GET** `/api/v1/clients/saved-searches/{search_id}/execute`

Executes a saved search with optional parameter overrides.

#### Query Parameters

- All standard search parameters can be provided to override saved values
- `page`, `per_page` for pagination
- `include_facets`, `include_highlights` for response options

## 📊 Export Features

### 7. Export Search Results

**POST** `/api/v1/clients/search/export`

Exports search results in various formats (CSV, Excel, PDF).

#### Request Body

```json
{
  "search_params": {
    "status": ["active"],
    "industry": ["Technology"]
  },
  "format": "csv",
  "fields": [
    "name",
    "primary_email",
    "primary_phone", 
    "status",
    "industry",
    "total_matters",
    "total_billed"
  ],
  "filename": "technology_clients.csv"
}
```

#### Response

```json
{
  "data": {
    "export_id": "export_789",
    "download_url": "https://api.example.com/downloads/export_789",
    "expires_at": "2024-12-07T16:30:00Z",
    "format": "csv",
    "estimated_rows": 120
  }
}
```

## 🔧 Search Implementation Details

### Full-Text Search Engine

```python
class ClientSearchService:
    def __init__(self, elasticsearch_client=None):
        self.es = elasticsearch_client
        
    async def full_text_search(
        self, 
        db: AsyncSession, 
        params: ClientSearchParams,
        org_id: UUID
    ) -> SearchResult:
        if self.es:
            # Use Elasticsearch for advanced full-text search
            return await self._elasticsearch_search(params, org_id)
        else:
            # Fallback to PostgreSQL full-text search
            return await self._postgres_search(db, params, org_id)
    
    async def _elasticsearch_search(self, params: ClientSearchParams, org_id: UUID):
        # Build Elasticsearch query
        query = {
            "bool": {
                "must": [
                    {"term": {"organization_id": str(org_id)}}
                ],
                "should": [],
                "filter": []
            }
        }
        
        # Add text search
        if params.query:
            query["bool"]["should"].extend([
                {"match": {"name": {"query": params.query, "boost": 3}}},
                {"match": {"emails.value": {"query": params.query, "boost": 2}}},
                {"match": {"phones.value": {"query": params.query, "boost": 2}}},
                {"match": {"notes": {"query": params.query, "boost": 1}}}
            ])
            query["bool"]["minimum_should_match"] = 1
        
        # Add filters
        if params.status:
            query["bool"]["filter"].append({"terms": {"status": params.status}})
        
        if params.type:
            query["bool"]["filter"].append({"terms": {"type": params.type}})
        
        # Execute search
        response = await self.es.search(
            index=f"clients_{org_id}",
            body={
                "query": query,
                "sort": [{params.sort_by: {"order": params.sort_order}}],
                "from": (params.page - 1) * params.per_page,
                "size": params.per_page,
                "highlight": {
                    "fields": {
                        "name": {},
                        "emails.value": {},
                        "phones.value": {}
                    }
                } if params.include_highlights else None,
                "aggs": self._build_aggregations() if params.include_facets else None
            }
        )
        
        return self._process_elasticsearch_response(response, params)
    
    async def _postgres_search(self, db: AsyncSession, params: ClientSearchParams, org_id: UUID):
        # Build SQLAlchemy query
        query = select(Client).where(Client.organization_id == org_id)
        
        # Add text search using PostgreSQL full-text search
        if params.query:
            search_vector = func.to_tsvector(
                'english',
                func.coalesce(Client.name, '') + ' ' +
                func.coalesce(Client.notes, '')
            )
            query = query.where(
                search_vector.match(func.plainto_tsquery('english', params.query))
            )
        
        # Add filters
        if params.status:
            query = query.where(Client.status.in_(params.status))
        
        if params.type:
            query = query.where(Client.type.in_(params.type))
        
        # Add sorting
        sort_column = getattr(Client, params.sort_by)
        if params.sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
        
        # Execute with pagination
        total_query = select(func.count()).select_from(query.subquery())
        total = await db.scalar(total_query)
        
        paginated_query = query.offset((params.page - 1) * params.per_page).limit(params.per_page)
        result = await db.execute(paginated_query)
        clients = result.scalars().all()
        
        # Build facets if requested
        facets = None
        if params.include_facets:
            facets = await self._build_postgres_facets(db, org_id)
        
        return SearchResult(
            clients=clients,
            total=total,
            facets=facets
        )
```

### Search Performance Optimization

```python
# Database indexes for efficient searching
CREATE INDEX CONCURRENTLY idx_clients_search_vector 
ON clients USING gin(to_tsvector('english', name || ' ' || COALESCE(notes, '')));

CREATE INDEX CONCURRENTLY idx_clients_org_status_type 
ON clients(organization_id, status, type);

CREATE INDEX CONCURRENTLY idx_clients_org_industry 
ON clients(organization_id, industry) 
WHERE industry IS NOT NULL;

CREATE INDEX CONCURRENTLY idx_clients_last_activity 
ON clients(organization_id, last_activity DESC);

# Materialized view for aggregations
CREATE MATERIALIZED VIEW client_filter_counts AS
SELECT 
    organization_id,
    status,
    type,
    industry,
    COUNT(*) as count
FROM clients
WHERE is_active = true
GROUP BY organization_id, status, type, industry;

CREATE UNIQUE INDEX ON client_filter_counts(organization_id, status, type, industry);
```

## 🚦 Rate Limiting

- **Search endpoints**: 100 requests per minute per user
- **Quick search**: 300 requests per minute per user (for real-time search)
- **Export operations**: 5 requests per hour per user
- **Saved searches**: 50 operations per hour per user

## 📈 Analytics & Monitoring

The search API includes built-in analytics to track:

- Most popular search terms
- Common filter combinations
- Search performance metrics
- Export usage patterns
- Saved search adoption

This comprehensive search API provides powerful, flexible client discovery capabilities while maintaining excellent performance and user experience.