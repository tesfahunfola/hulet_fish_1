# Etxplore API Documentation

## Base URL

```
http://localhost:3000/api/v1
```

## Getting Started

1. Make sure your backend server is running on `http://localhost:3000` (or set the API base for the frontend using Vite env below)
2. The frontend is configured to connect to this backend automatically
3. All authenticated requests require a Bearer token in the Authorization header

## Authentication

All authenticated requests automatically include the token from localStorage via axios interceptors.

### Endpoints

#### Sign Up

```
POST /api/v1/users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "passwordConfirm": "password123"
}

Response: { token: string, data: { user: {...} } }
```

#### Login

```
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token: string, data: { user: {...} } }
```

#### Forgot Password

```
POST /api/v1/users/forgotPassword
Content-Type: application/json

{
  "email": "john@example.com"
}

Response: { status: "success", message: "Token sent to email" }
```

#### Reset Password

```
PATCH /api/v1/users/resetPassword/:token
Content-Type: application/json

{
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}

Response: { token: string, data: { user: {...} } }
```

#### Update My Password

```
PATCH /api/v1/users/updateMyPassword
Authorization: Bearer {token}
Content-Type: application/json

{
  "passwordCurrent": "currentpassword",
  "password": "newpassword123",
  "passwordConfirm": "newpassword123"
}

Response: { token: string, data: { user: {...} } }
```

## Tours

### Endpoints

#### Get All Tours

```
GET /api/v1/tours
GET /api/v1/tours?difficulty=easy
GET /api/v1/tours?duration[gte]=7&sort=price
GET /api/v1/tours?price[lte]=500

Response: { status: "success", results: number, data: { data: [...] } }
```

**Supported Query Parameters:**

- `difficulty`: easy, medium, difficult
- `duration[gte]`, `duration[lte]`, `duration[gt]`, `duration[lt]`: Filter by duration
- `price[gte]`, `price[lte]`, `price[gt]`, `price[lt]`: Filter by price
- `sort`: price, -price, ratingsAverage, -ratingsAverage, duration, -duration
- `fields`: Select specific fields (e.g., fields=name,duration,price)
- `page`, `limit`: Pagination

#### Get Single Tour

```
GET /api/v1/tours/:id

Response: { status: "success", data: { data: {...} } }
```

#### Get Top 5 Cheap Tours

```
GET /api/v1/tours/top-5-cheap

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Tour Statistics

```
GET /api/v1/tours/tour-stats

Response: { status: "success", data: { stats: [...] } }
```

#### Get Monthly Plan

```
GET /api/v1/tours/monthly-plan/:year
Authorization: Bearer {token}

Example: GET /api/v1/tours/monthly-plan/2024

Response: { status: "success", data: { plan: [...] } }
```

#### Get Tours Within Radius

```
GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit

Example: GET /api/v1/tours/tours-within/200/center/34.111745,-118.113491/unit/mi

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Distances to Tours

```
GET /api/v1/tours/distances/:latlng/unit/:unit

Example: GET /api/v1/tours/distances/34.111745,-118.113491/unit/mi

Response: { status: "success", data: { data: [...] } }
```

#### Create Tour (Admin Only)

```
POST /api/v1/tours
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Tour",
  "duration": 7,
  "maxGroupSize": 10,
  "difficulty": "medium",
  "price": 500,
  "summary": "Amazing tour",
  "imageCover": "tour-cover.jpg"
}

Response: { status: "success", data: { data: {...} } }
```

#### Update Tour (Admin Only)

```
PATCH /api/v1/tours/:id
Authorization: Bearer {token}
Content-Type: application/json or multipart/form-data (for images)

{
  "price": 550,
  "duration": 8
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete Tour (Admin Only)

```
DELETE /api/v1/tours/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

## Reviews

### Endpoints

#### Get All Reviews

```
GET /api/v1/reviews
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single Review

```
GET /api/v1/reviews/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get Reviews for Tour

```
GET /api/v1/tours/:tourId/reviews
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Create Review

```
POST /api/v1/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "review": "Amazing experience!",
  "rating": 5,
  "tour": "tourId",
  "user": "userId"
}

Response: { status: "success", data: { data: {...} } }
```

#### Create Review for Tour (Nested Route)

```
POST /api/v1/tours/:tourId/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "review": "Amazing experience!",
  "rating": 5
}

Response: { status: "success", data: { data: {...} } }
```

#### Update Review

```
PATCH /api/v1/reviews/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "review": "Updated review"
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete Review

```
DELETE /api/v1/reviews/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

## Users

### Endpoints

#### Get All Users (Admin Only)

```
GET /api/v1/users
GET /api/v1/users?role=user
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single User (Admin Only)

```
GET /api/v1/users/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get Current User

```
GET /api/v1/users/me
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Update Current User

```
PATCH /api/v1/users/updateMe
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}

Response: { status: "success", data: { user: {...} } }
```

#### Delete Current User

```
DELETE /api/v1/users/deleteMe
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

#### Update User (Admin Only)

```
PATCH /api/v1/users/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}

Response: { status: "success", data: { data: {...} } }
```

#### Delete User (Admin Only)

```
DELETE /api/v1/users/:id
Authorization: Bearer {token}

Response: { status: "success", data: null }
```

## Bookings

### Endpoints

#### Get All Bookings (Admin Only)

```
GET /api/v1/bookings
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Get Single Booking

```
GET /api/v1/bookings/:id
Authorization: Bearer {token}

Response: { status: "success", data: { data: {...} } }
```

#### Get My Bookings

```
GET /api/v1/bookings/my-bookings
Authorization: Bearer {token}

Response: { status: "success", results: number, data: { data: [...] } }
```

#### Create Booking

```
POST /api/v1/bookings
Authorization: Bearer {token}
Content-Type: application/json

{
  "tour": "tourId"
}

Response: { status: "success", data: { data: {...} } }
```

## Frontend Pages Connected to API

### Public Pages

1. **Home** (`/`)

   - Fetches top 5 cheap tours
   - Uses: `GET /api/v1/tours/top-5-cheap`

2. **All Tours** (`/tours`)

   - Lists all tours with filters
   - Uses: `GET /api/v1/tours` with query params

3. **Single Tour** (`/tours/:id`)

   - Shows tour details and reviews
   - Uses: `GET /api/v1/tours/:id`
   - Uses: `GET /api/v1/tours/:tourId/reviews`

4. **About** (`/about`)

   - Static page

5. **Contact** (`/contact`)

   - Contact form (frontend only for now)

6. **Login** (`/login`)

   - Uses: `POST /api/v1/users/login`

7. **Signup** (`/signup`)

   - Uses: `POST /api/v1/users/signup`

8. **Forgot Password** (`/forgot-password`)

   - Uses: `POST /api/v1/users/forgotPassword`

9. **Reset Password** (`/reset-password/:token`)
   - Uses: `PATCH /api/v1/users/resetPassword/:token`

### Protected Pages (Require Authentication)

1. **Profile** (`/profile`)

   - Shows user info
   - Uses: `GET /api/v1/users/me`

2. **My Bookings** (`/my-bookings`)

   - Lists user's bookings
   - Uses: `GET /api/v1/bookings/my-bookings`

3. **My Reviews** (`/my-reviews`)
   - Lists user's reviews
   - Uses: `GET /api/v1/reviews` (filtered by user)
   - Delete review: `DELETE /api/v1/reviews/:id`

## Testing Locally

### Prerequisites

1. Backend server running on `http://localhost:3000`
2. Frontend running (default: `http://localhost:5173` with Vite). When deploying the frontend separately, set the environment variable `VITE_API_BASE_URL` at build time to point to your backend API (for example: `https://api.yourdomain.com/api/v1`).

### Step-by-Step Testing Guide

#### 1. Test Authentication Flow

1. Go to `/signup` and create a new account
2. Check that you're redirected to home and see your name in the navigation
3. Logout from `/profile`
4. Go to `/login` and login with your credentials
5. Test "Forgot Password" link (if backend email is configured)

#### 2. Test Tours

1. Go to `/tours` to see all tours
2. Use the difficulty filters to filter tours
3. Click "Connect to API" button to fetch from backend
4. Click on a tour to view details at `/tours/:id`

#### 3. Test Bookings

1. While logged in, go to a tour detail page
2. Click "Book Now" (if implemented)
3. Go to `/my-bookings` to see your bookings
4. Check that bookings display correctly

#### 4. Test Reviews

1. While logged in, go to `/my-reviews`
2. If you have reviews, they should display
3. Test delete functionality
4. Try creating a review on a tour page

### Troubleshooting

#### CORS Issues

If you see CORS errors, make sure your backend has CORS configured:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

#### 401 Unauthorized

- Check that the token is being stored in localStorage
- Check that the Authorization header is being sent
- Verify token hasn't expired

#### Network Errors

- Ensure backend is running on correct port (3000)
- Check that API_BASE_URL in `src/lib/api.ts` is correct
- Use browser DevTools Network tab to inspect requests

## API Response Format

All API responses follow this structure:

### Success Response

```json
{
  "status": "success",
  "results": 10,  // Optional, for collections
  "data": {
    "data": { ... } // Or array of data
  }
}
```

### Error Response

```json
{
  "status": "fail", // or "error"
  "message": "Error message here"
}
```

## Environment Variables

The frontend uses these configuration:

- `API_BASE_URL`: Set in `src/lib/api.ts` to `http://localhost:3000/api/v1`

For production, update this to your production API URL.
