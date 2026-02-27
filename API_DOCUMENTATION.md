# API Documentation

## Base URL
`https://api.skyecomservices.com/v1`

## Authentication
All API requests must include a valid API key in the `Authorization` header. For example:
```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### 1. User Registration
- **Endpoint:** `/users/register`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - **201 Created**
    ```json
    {
      "id": "string",
      "username": "string",
      "email": "string"
    }
    ```

### 2. User Login
- **Endpoint:** `/users/login`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  - **200 OK**
    ```json
    {
      "token": "string",
      "user_id": "string"
    }
    ```

### 3. Fetch User Profile
- **Endpoint:** `/users/profile`
- **Method:** `GET`
- **Authorization:** Required
- **Response:**
  - **200 OK**
    ```json
    {
      "id": "string",
      "username": "string",
      "email": "string"
    }
    ```

### 4. Update User Profile
- **Endpoint:** `/users/profile`
- **Method:** `PUT`
- **Authorization:** Required
- **Request Body:**
  ```json
  {
    "username": "string",
    "email": "string"
  }
  ```
- **Response:**
  - **200 OK**
    ```json
    {
      "message": "Profile updated successfully"
    }
    ```

### 5. Delete User Account
- **Endpoint:** `/users/delete`
- **Method:** `DELETE`
- **Authorization:** Required
- **Response:**
  - **204 No Content**

## Error Responses
- **400 Bad Request**: The request was unacceptable, often due to missing a required parameter.
- **401 Unauthorized**: No valid API key provided.
- **404 Not Found**: The requested resource does not exist.
- **500 Internal Server Error**: Something went wrong on our end.

## Rate Limiting
- All API requests are limited to 1000 requests per hour.

## Contact
For support, please reach out at support@skyecomservices.com.
