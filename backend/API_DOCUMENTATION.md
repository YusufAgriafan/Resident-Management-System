# API Documentation - Resident Management System

Base URL: `http://localhost:8000/api`

## Authentication

All endpoints (except `/login`) require authentication using Laravel Sanctum token.

Include the token in the `Authorization` header:

```
Authorization: Bearer {your_token}
```

---

## 📋 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Residents](#residents-endpoints)
3. [Houses](#houses-endpoints)
4. [Bills](#bills-endpoints)
5. [Payments](#payments-endpoints)
6. [Expenses](#expenses-endpoints)
7. [Reports](#reports-endpoints)

---

## Authentication Endpoints

### Login

**POST** `/login`

**Request Body:**

```json
{
    "email": "admin@example.com",
    "password": "password"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Login successful",
    "access_token": "1|xxxxxxxxxxxxx",
    "user": {
        "id": 1,
        "name": "Admin",
        "email": "admin@example.com"
    }
}
```

### Logout

**POST** `/logout`

**Response:**

```json
{
    "message": "Logout successful"
}
```

### Get Current User

**GET** `/user`

**Response:**

```json
{
    "id": 1,
    "name": "Admin",
    "email": "admin@example.com"
}
```

---

## Residents Endpoints

### Get All Residents

**GET** `/residents`

**Response:**

```json
{
    "status": "success",
    "message": "Residents retrieved successfully",
    "data": [
        {
            "id": 1,
            "name": "John Doe",
            "ktp": "ktp/xxxxx.jpg",
            "phone": "081234567890",
            "resident_type": "permanent",
            "marital_status": "married",
            "created_at": "2026-02-26T10:00:00.000000Z",
            "updated_at": "2026-02-26T10:00:00.000000Z",
            "house_resident_histories": []
        }
    ]
}
```

### Create Resident

**POST** `/residents`

**Request Body (multipart/form-data):**

- `name` (required): Full name
- `ktp` (required): KTP image file (jpeg, png, jpg, max 2MB)
- `phone` (required): Phone number
- `resident_type` (required): `permanent` or `contract`
- `marital_status` (required): `single` or `married`

**Response:**

```json
{
    "status": "success",
    "message": "Resident created successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "ktp": "ktp/xxxxx.jpg",
        "phone": "081234567890",
        "resident_type": "permanent",
        "marital_status": "married"
    }
}
```

### Get Resident by ID

**GET** `/residents/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Resident retrieved successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "ktp": "ktp/xxxxx.jpg",
        "phone": "081234567890",
        "resident_type": "permanent",
        "marital_status": "married",
        "house_resident_histories": [],
        "bills": []
    }
}
```

### Update Resident

**POST** `/residents/{id}` (Using POST because of file upload)

**Request Body (multipart/form-data):**

- `name` (optional): Full name
- `ktp` (optional): KTP image file
- `phone` (optional): Phone number
- `resident_type` (optional): `permanent` or `contract`
- `marital_status` (optional): `single` or `married`

**Response:**

```json
{
    "status": "success",
    "message": "Resident updated successfully",
    "data": {...}
}
```

### Delete Resident

**DELETE** `/residents/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Resident deleted successfully"
}
```

---

## Houses Endpoints

### Get All Houses

**GET** `/houses`

**Response:**

```json
{
    "status": "success",
    "message": "Houses retrieved successfully",
    "data": [
        {
            "id": 1,
            "code": "A-01",
            "status": "occupied",
            "created_at": "2026-02-26T10:00:00.000000Z",
            "updated_at": "2026-02-26T10:00:00.000000Z",
            "house_resident_histories": [],
            "bills": []
        }
    ]
}
```

### Create House

**POST** `/houses`

**Request Body:**

```json
{
    "code": "A-01",
    "status": "vacant"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "House created successfully",
    "data": {
        "id": 1,
        "code": "A-01",
        "status": "vacant"
    }
}
```

### Get House by ID

**GET** `/houses/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "House retrieved successfully",
    "data": {
        "id": 1,
        "code": "A-01",
        "status": "occupied",
        "house_resident_histories": [],
        "bills": []
    }
}
```

### Update House

**PUT** `/houses/{id}`

**Request Body:**

```json
{
    "code": "A-01",
    "status": "occupied"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "House updated successfully",
    "data": {...}
}
```

### Delete House

**DELETE** `/houses/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "House deleted successfully"
}
```

### Assign Resident to House

**POST** `/houses/{id}/assign-resident`

**Request Body:**

```json
{
    "resident_id": 1,
    "start_date": "2026-01-01",
    "end_date": null
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Resident assigned to house successfully",
    "data": {
        "id": 1,
        "house_id": 1,
        "resident_id": 1,
        "start_date": "2026-01-01",
        "end_date": null,
        "resident": {...}
    }
}
```

### Remove Resident from House

**POST** `/houses/{id}/remove-resident`

**Response:**

```json
{
    "status": "success",
    "message": "Resident removed from house successfully"
}
```

### Get Resident History

**GET** `/houses/{id}/resident-history`

**Response:**

```json
{
    "status": "success",
    "message": "Resident history retrieved successfully",
    "data": [
        {
            "id": 1,
            "house_id": 1,
            "resident_id": 1,
            "start_date": "2026-01-01",
            "end_date": "2026-06-30",
            "resident": {...}
        }
    ]
}
```

### Get Payment History

**GET** `/houses/{id}/payment-history`

**Response:**

```json
{
    "status": "success",
    "message": "Payment history retrieved successfully",
    "data": [
        {
            "id": 1,
            "resident_id": 1,
            "house_id": 1,
            "billing_year": 2026,
            "billing_month": 2,
            "total": 115000,
            "status": "paid",
            "resident": {...},
            "payments": [...]
        }
    ]
}
```

---

## Bills Endpoints

### Get All Bills

**GET** `/bills?month=2&year=2026&status=unpaid`

**Query Parameters:**

- `month` (optional): Filter by month (1-12)
- `year` (optional): Filter by year
- `status` (optional): Filter by status (`unpaid`, `partial`, `paid`)

**Response:**

```json
{
    "status": "success",
    "message": "Bills retrieved successfully",
    "data": [
        {
            "id": 1,
            "resident_id": 1,
            "house_id": 1,
            "billing_year": 2026,
            "billing_month": 2,
            "due_date": "2026-03-01",
            "security_fee": 100000,
            "maintenance_fee": 15000,
            "total": 115000,
            "status": "unpaid",
            "resident": {...},
            "house": {...},
            "payments": []
        }
    ]
}
```

### Create Bill

**POST** `/bills`

**Request Body:**

```json
{
    "resident_id": 1,
    "house_id": 1,
    "billing_year": 2026,
    "billing_month": 2,
    "due_date": "2026-03-01",
    "security_fee": 100000,
    "maintenance_fee": 15000
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Bill created successfully",
    "data": {
        "id": 1,
        "resident_id": 1,
        "house_id": 1,
        "billing_year": 2026,
        "billing_month": 2,
        "due_date": "2026-03-01",
        "security_fee": 100000,
        "maintenance_fee": 15000,
        "total": 115000,
        "status": "unpaid",
        "resident": {...},
        "house": {...}
    }
}
```

### Get Bill by ID

**GET** `/bills/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Bill retrieved successfully",
    "data": {
        "id": 1,
        "resident_id": 1,
        "house_id": 1,
        "billing_year": 2026,
        "billing_month": 2,
        "total": 115000,
        "status": "unpaid",
        "resident": {...},
        "house": {...},
        "payments": []
    }
}
```

### Update Bill

**PUT** `/bills/{id}`

**Request Body:**

```json
{
    "security_fee": 100000,
    "maintenance_fee": 15000,
    "status": "paid"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Bill updated successfully",
    "data": {...}
}
```

### Delete Bill

**DELETE** `/bills/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Bill deleted successfully"
}
```

### Generate Monthly Bills

**POST** `/bills/generate-monthly`

Generate bills for all occupied houses automatically.

**Request Body:**

```json
{
    "billing_year": 2026,
    "billing_month": 3,
    "security_fee": 100000,
    "maintenance_fee": 15000,
    "due_date": "2026-03-10"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Generated 15 bills successfully",
    "data": [...]
}
```

---

## Payments Endpoints

### Get All Payments

**GET** `/payments?start_date=2026-01-01&end_date=2026-12-31`

**Query Parameters:**

- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date

**Response:**

```json
{
    "status": "success",
    "message": "Payments retrieved successfully",
    "data": [
        {
            "id": 1,
            "bill_id": 1,
            "paid_amount": 115000,
            "payment_date": "2026-02-26",
            "payment_method": "Transfer",
            "notes": "Paid in full",
            "bill": {...}
        }
    ]
}
```

### Create Payment

**POST** `/payments`

**Request Body:**

```json
{
    "bill_id": 1,
    "paid_amount": 115000,
    "payment_date": "2026-02-26",
    "payment_method": "Transfer",
    "notes": "Paid in full"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Payment recorded successfully",
    "data": {
        "id": 1,
        "bill_id": 1,
        "paid_amount": 115000,
        "payment_date": "2026-02-26",
        "payment_method": "Transfer",
        "notes": "Paid in full",
        "bill": {...}
    }
}
```

### Get Payment by ID

**GET** `/payments/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Payment retrieved successfully",
    "data": {
        "id": 1,
        "bill_id": 1,
        "paid_amount": 115000,
        "payment_date": "2026-02-26",
        "bill": {...}
    }
}
```

### Update Payment

**PUT** `/payments/{id}`

**Request Body:**

```json
{
    "paid_amount": 115000,
    "payment_date": "2026-02-26",
    "payment_method": "Cash",
    "notes": "Updated payment"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Payment updated successfully",
    "data": {...}
}
```

### Delete Payment

**DELETE** `/payments/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Payment deleted successfully"
}
```

---

## Expenses Endpoints

### Get All Expenses

**GET** `/expenses?start_date=2026-01-01&end_date=2026-12-31&category=security`

**Query Parameters:**

- `start_date` (optional): Filter from date
- `end_date` (optional): Filter to date
- `category` (optional): Filter by category

**Response:**

```json
{
    "status": "success",
    "message": "Expenses retrieved successfully",
    "data": [
        {
            "id": 1,
            "title": "Security Guard Salary",
            "description": "Monthly salary for security guard",
            "amount": 3000000,
            "expense_date": "2026-02-26",
            "category": "salary"
        }
    ]
}
```

### Create Expense

**POST** `/expenses`

**Request Body:**

```json
{
    "title": "Security Guard Salary",
    "description": "Monthly salary for security guard",
    "amount": 3000000,
    "expense_date": "2026-02-26",
    "category": "salary"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Expense created successfully",
    "data": {
        "id": 1,
        "title": "Security Guard Salary",
        "description": "Monthly salary for security guard",
        "amount": 3000000,
        "expense_date": "2026-02-26",
        "category": "salary"
    }
}
```

### Get Expense by ID

**GET** `/expenses/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Expense retrieved successfully",
    "data": {
        "id": 1,
        "title": "Security Guard Salary",
        "amount": 3000000,
        "expense_date": "2026-02-26",
        "category": "salary"
    }
}
```

### Update Expense

**PUT** `/expenses/{id}`

**Request Body:**

```json
{
    "title": "Security Guard Salary",
    "amount": 3500000,
    "category": "salary"
}
```

**Response:**

```json
{
    "status": "success",
    "message": "Expense updated successfully",
    "data": {...}
}
```

### Delete Expense

**DELETE** `/expenses/{id}`

**Response:**

```json
{
    "status": "success",
    "message": "Expense deleted successfully"
}
```

### Get Expense Categories Summary

**GET** `/expenses/categories/summary?start_date=2026-01-01&end_date=2026-12-31`

**Response:**

```json
{
    "status": "success",
    "message": "Expense categories retrieved successfully",
    "data": [
        {
            "category": "salary",
            "total_amount": 3000000,
            "count": 1
        },
        {
            "category": "maintenance",
            "total_amount": 500000,
            "count": 3
        }
    ]
}
```

---

## Reports Endpoints

### Get Monthly Summary

**GET** `/reports/monthly-summary?year=2026&month=2`

**Response:**

```json
{
    "status": "success",
    "message": "Monthly summary retrieved successfully",
    "data": {
        "year": 2026,
        "month": 2,
        "summary": {
            "total_income": 1725000,
            "total_expenses": 3500000,
            "balance": -1775000
        },
        "expenses_by_category": [...],
        "payments": [...],
        "expense_details": [...]
    }
}
```

### Get Yearly Summary

**GET** `/reports/yearly-summary?year=2026`

**Response:**

```json
{
    "status": "success",
    "message": "Yearly summary retrieved successfully",
    "data": {
        "year": 2026,
        "yearly_totals": {
            "total_income": 20700000,
            "total_expenses": 42000000,
            "balance": -21300000
        },
        "monthly_summary": [
            {
                "month": 1,
                "month_name": "January",
                "total_income": 1725000,
                "total_expenses": 3500000,
                "balance": -1775000
            },
            ...
        ]
    }
}
```

### Get Unpaid Bills Report

**GET** `/reports/unpaid-bills`

**Response:**

```json
{
    "status": "success",
    "message": "Unpaid bills retrieved successfully",
    "data": {
        "total_unpaid_amount": 1725000,
        "unpaid_bills_count": 15,
        "bills": [...]
    }
}
```

### Get Overdue Bills Report

**GET** `/reports/overdue-bills`

**Response:**

```json
{
    "status": "success",
    "message": "Overdue bills retrieved successfully",
    "data": {
        "total_overdue_amount": 575000,
        "overdue_bills_count": 5,
        "bills": [...]
    }
}
```

### Get Dashboard Statistics

**GET** `/reports/dashboard`

**Response:**

```json
{
    "status": "success",
    "message": "Dashboard statistics retrieved successfully",
    "data": {
        "current_month": {
            "month": 2,
            "year": 2026,
            "income": 1725000,
            "expenses": 3500000,
            "balance": -1775000
        },
        "bills": {
            "unpaid_count": 15,
            "unpaid_amount": 1725000,
            "overdue_count": 5
        },
        "houses": {
            "total": 20,
            "occupied": 15,
            "vacant": 5
        },
        "residents": {
            "total": 18,
            "permanent": 15,
            "contract": 3
        }
    }
}
```

### Get Chart Data (for graphs)

**GET** `/reports/chart-data?year=2026`

**Response:**

```json
{
    "status": "success",
    "message": "Chart data retrieved successfully",
    "data": [
        {
            "month": 1,
            "month_name": "Jan",
            "income": 1725000,
            "expenses": 3500000,
            "balance": -1775000
        },
        ...
    ]
}
```

---

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
    "status": "success",
    "message": "Operation successful",
    "data": {...}
}
```

### Error Response

```json
{
    "status": "error",
    "message": "Error message description"
}
```

### Validation Error Response

```json
{
    "message": "The given data was invalid.",
    "errors": {
        "field_name": ["Error message"]
    }
}
```

---

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `404` - Not Found (Resource not found)
- `422` - Unprocessable Entity (Validation error)
- `401` - Unauthorized (Not authenticated)
- `500` - Internal Server Error

---

## Common Fee Values

Based on the requirements:

- **Security Fee (Iuran Satpam)**: Rp 100,000 per month
- **Maintenance Fee (Iuran Kebersihan)**: Rp 15,000 per month
- **Total Monthly Fee**: Rp 115,000 per house

## Resident Types

- `permanent` - Penghuni tetap (always billed)
- `contract` - Penghuni kontrak (billed only when occupied)

## House Status

- `occupied` - Dihuni
- `vacant` - Tidak dihuni

## Bill Status

- `unpaid` - Belum dibayar
- `partial` - Dibayar sebagian
- `paid` - Lunas

## Marital Status

- `single` - Belum menikah
- `married` - Sudah menikah
