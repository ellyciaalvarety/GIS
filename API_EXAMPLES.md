# API Usage Examples

## Example 1: Get All Provinces

```bash
curl http://localhost:8000/api/provinces
```

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Aceh",
      "population": 56959,
      "semester_1": {
        "misery_count": 676247,
        "percentage": 1188.89
      },
      "semester_2": {
        "misery_count": 715103,
        "percentage": 1255.09
      }
    },
    {
      "id": 2,
      "name": "Sumatera Utara",
      "population": 159786,
      "semester_1": {
        "misery_count": 666546,
        "percentage": 417.26
      },
      "semester_2": {
        "misery_count": 718220,
        "percentage": 449.61
      }
    }
  ],
  "meta": {
    "total": 34
  }
}
```

---

## Example 2: Get Specific Province

```bash
curl http://localhost:8000/api/provinces/11
```

**Response:**

```json
{
  "data": {
    "id": 11,
    "name": "DKI Jakarta",
    "population": 106697,
    "semester_1": {
      "misery_count": 852768,
      "percentage": 799.07
    },
    "semester_2": {
      "misery_count": 897768,
      "percentage": 841.48
    }
  }
}
```

---

## Example 3: Search Provinces

```bash
curl "http://localhost:8000/api/provinces/search?q=java"
```

**Response:**

```json
{
  "data": [
    {
      "id": 12,
      "name": "Jawa Barat",
      "population": 511639,
      "semester_1": {
        "misery_count": 547752,
        "percentage": 107.05
      },
      "semester_2": {
        "misery_count": 575499,
        "percentage": 112.47
      }
    },
    {
      "id": 13,
      "name": "Jawa Tengah",
      "population": 38565,
      "semester_1": {
        "misery_count": 537812,
        "percentage": 1394.74
      },
      "semester_2": {
        "misery_count": 570870,
        "percentage": 1480.29
      }
    },
    {
      "id": 15,
      "name": "Jawa Timur",
      "population": 42352,
      "semester_1": {
        "misery_count": 558029,
        "percentage": 1318.65
      },
      "semester_2": {
        "misery_count": 585020,
        "percentage": 1381.68
      }
    }
  ],
  "total": 3
}
```

---

## Example 4: Get Top Provinces (Semester 1)

```bash
curl "http://localhost:8000/api/provinces/top?semester=1&limit=5"
```

**Response:**

```json
{
  "data": [
    {
      "id": 9,
      "name": "Kepulauan Bangka Belitung",
      "population": 15697,
      "semester_1": {
        "misery_count": 956833,
        "percentage": 6099.01
      },
      "semester_2": {
        "misery_count": 992426,
        "percentage": 6325.98
      }
    },
    {
      "id": 24,
      "name": "Kalimantan Utara",
      "population": 7588,
      "semester_1": {
        "misery_count": 884970,
        "percentage": 11658.68
      },
      "semester_2": {
        "misery_count": 933675,
        "percentage": 12298.06
      }
    },
    {
      "id": 23,
      "name": "Kalimantan Timur",
      "population": 44784,
      "semester_1": {
        "misery_count": 866193,
        "percentage": 1935.6
      },
      "semester_2": {
        "misery_count": 897759,
        "percentage": 2005.3
      }
    },
    {
      "id": 33,
      "name": "Papua Barat",
      "population": 5965,
      "semester_1": {
        "misery_count": 831001,
        "percentage": 13934.89
      },
      "semester_2": {
        "misery_count": 868631,
        "percentage": 14565.56
      }
    },
    {
      "id": 10,
      "name": "Kepulauan Riau",
      "population": 22431,
      "semester_1": {
        "misery_count": 832410,
        "percentage": 3710.98
      },
      "semester_2": {
        "misery_count": 870738,
        "percentage": 3882.66
      }
    }
  ],
  "semester": 1,
  "total": 5
}
```

---

## Example 5: Get Overall Statistics

```bash
curl http://localhost:8000/api/statistics/summary
```

**Response:**

```json
{
  "data": {
    "total_provinces": 34,
    "total_population": 5838000,
    "semester_1": {
      "misery_count": 21234567,
      "percentage": 364.02
    },
    "semester_2": {
      "misery_count": 22456789,
      "percentage": 384.67
    },
    "trend": 5.74
  }
}
```

---

## Example 6: Using with JavaScript Fetch

```javascript
// Get all provinces
fetch("http://localhost:8000/api/provinces")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Search provinces
fetch("http://localhost:8000/api/provinces/search?q=bali")
  .then((res) => res.json())
  .then((data) => console.log(data));

// Get statistics
fetch("http://localhost:8000/api/statistics/summary")
  .then((res) => res.json())
  .then((data) => {
    console.log(`Total Population: ${data.data.total_population}`);
    console.log(`Semester 1 Percentage: ${data.data.semester_1.percentage}%`);
    console.log(`Semester 2 Percentage: ${data.data.semester_2.percentage}%`);
  });
```

---

## Example 7: Using with Python Requests

```python
import requests

# Get all provinces
response = requests.get('http://localhost:8000/api/provinces')
provinces = response.json()
print(f"Total provinces: {provinces['meta']['total']}")

# Search provinces
response = requests.get('http://localhost:8000/api/provinces/search', params={'q': 'sulawesi'})
results = response.json()
print(f"Found {results['total']} results")

# Get top provinces
response = requests.get('http://localhost:8000/api/provinces/top',
                       params={'semester': 1, 'limit': 10})
top_provinces = response.json()
for province in top_provinces['data']:
    print(f"{province['name']}: {province['semester_1']['percentage']}%")

# Get statistics
response = requests.get('http://localhost:8000/api/statistics/summary')
stats = response.json()['data']
print(f"National poverty rate S1: {stats['semester_1']['percentage']}%")
```

---

## Example 8: Using Postman

### Step 1: Create Collection

1. Open Postman
2. Click "Create new collection"
3. Name it "Poverty Statistics"

### Step 2: Add Requests

**Request 1: List All**

- Method: GET
- URL: `http://localhost:8000/api/provinces`
- Click Send

**Request 2: Search**

- Method: GET
- URL: `http://localhost:8000/api/provinces/search`
- Params: `q` = `aceh`
- Click Send

**Request 3: Statistics**

- Method: GET
- URL: `http://localhost:8000/api/statistics/summary`
- Click Send

---

## Example 9: Error Handling

```javascript
fetch("http://localhost:8000/api/provinces/9999")
  .then((res) => {
    if (res.status === 404) {
      console.log("Province not found");
      return;
    }
    return res.json();
  })
  .then((data) => console.log(data.data))
  .catch((error) => console.error("Error:", error));
```

---

## Response Codes

| Code | Meaning                               |
| ---- | ------------------------------------- |
| 200  | Success                               |
| 400  | Bad request (missing query parameter) |
| 404  | Not found (province ID doesn't exist) |
| 500  | Server error                          |

---

## Data Notes

- All misery counts are actual people
- Population in thousands
- Percentages are calculated as: (misery_count / population) × 100
- Trend shows semester-over-semester change in misery count

---

**Ready to explore the API!** 🚀
