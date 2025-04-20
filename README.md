# CO2 Bunny - Website Carbon Impact Analysis API

CO2 Bunny is a RESTful API service that analyzes and calculates the carbon footprint of websites based on their data transfer, hosting energy sources, and traffic patterns.

## Base URL

```
https://bunny.srijit.org
```

## API Endpoints

### Data Transfer Impact

Analyzes the carbon impact of a website's data transfer.

```http
GET /api/impact/data-transfer
```

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | **Required**. The URL of the website to analyze |

#### Response

```javascript
{
  "url": "example.com",
  "data_transfer_kb": 1234.56,
  "energy_used_kwh": 0.123,
  "carbon_emissions_grams": 0.456,
  "green_rating": "A",
  "cleanerThan": "95%"
}
```

### Energy Source Analysis

Checks if a website is hosted on green energy servers.

```http
GET /api/impact/energy-source
```

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | **Required**. The URL of the website to analyze |

#### Response

```javascript
{
  "url": "example.com",
  "green_hosting": true,
  "provider": "Green Host Provider",
  "carbon_savings_grams": 10.0,
  "sustainability_report": "https://example.com/sustainability"
}
```

### Traffic Impact Analysis

Calculates the carbon impact based on website traffic.

```http
GET /api/impact/traffic
```

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | **Required**. The URL of the website |
| `annualPageViews` | `number` | **Required**. Estimated annual page views |

#### Response

```javascript
{
  "url": "example.com",
  "annual_page_views": 1000000,
  "carbon_per_view_grams": 0.3,
  "total_annual_emissions_kg": 300
}
```

### Calculate Total Impact

Performs a comprehensive analysis combining all metrics.

```http
POST /api/impact/calculate
```

#### Request Body

```javascript
{
  "url": "example.com",
  "annualPageViews": 1000000
}
```

#### Response

```javascript
{
  "id": "...",
  "url": "example.com",
  "dataTransferKB": 1234.56,
  "energyUsedKWh": 0.123,
  "carbonEmissionsG": 0.456,
  "greenHosting": true,
  "provider": "Green Host Provider",
  "annualPageViews": 1000000,
  "carbonPerViewG": 0.3,
  "totalAnnualEmissionsKg": 295,
  "createdAt": "2024-03-15T12:00:00Z",
  "message": "New analysis created"
}
```

### Historical Analyses

Retrieve historical analyses for a specific URL.

```http
GET /api/analyses
```

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `url` | `string` | **Required**. The URL to fetch analyses for |

#### Response

```javascript
[
  {
    "id": "...",
    "url": "example.com",
    "dataTransferKB": 1234.56,
    "energyUsedKWh": 0.123,
    "carbonEmissionsG": 0.456,
    "greenHosting": true,
    "provider": "Green Host Provider",
    "annualPageViews": 1000000,
    "carbonPerViewG": 0.3,
    "totalAnnualEmissionsKg": 295,
    "createdAt": "2024-03-15T12:00:00Z"
  }
]
```

### Recent Analyses

Retrieve the most recent analyses across all URLs.

```http
GET /api/analyses/recent
```

#### Query Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `limit` | `number` | Optional. Number of analyses to return (default: 10, max: 100) |

#### Response

```javascript
[
  {
    "id": "...",
    "url": "example.com",
    "dataTransferKB": 1234.56,
    "energyUsedKWh": 0.123,
    "carbonEmissionsG": 0.456,
    "greenHosting": true,
    "provider": "Green Host Provider",
    "annualPageViews": 1000000,
    "carbonPerViewG": 0.3,
    "totalAnnualEmissionsKg": 295,
    "createdAt": "2024-03-15T12:00:00Z"
  }
]
```

## Error Responses

The API uses conventional HTTP response codes to indicate the success or failure of requests:

- `200 OK`: Request successful
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server-side error

Error responses follow this format:

```javascript
{
  "error": "Error message description",
  "details": "Additional error details (if available)"
}
```

## Rate Limiting

The API currently does not implement rate limiting. Have fun with it.

## Caching

Analyses are cached on an M10 cluster Database. Requesting an analysis for the same URL and annual page views contained in the Database will return the cached analysis. Future plans include using MongoDB Charts to create cool analytics. That's why I'm hoarding the data.
