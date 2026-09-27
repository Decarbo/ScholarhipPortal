# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites Check
```bash
# Check Node.js version (should be 14+)
node --version

# Check MongoDB (should be running)
mongod --version
```

### Step 1: Install Dependencies
```bash
cd server
npm install
```

### Step 2: Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
```env
MONGODB_URI=mongodb://localhost:27017/scholarship_db
JWT_SECRET=my_super_secret_key_12345
SEED_DEFAULT_PASSWORD=password123
```

### Step 3: Start MongoDB
```bash
# Terminal 1: Start MongoDB
mongod
```

### Step 4: Seed Database
```bash
# Terminal 2: In server directory
npm run seed
```

You'll see output like:
```
✅ Database seeded successfully!

📊 Summary:
   - Students: 18
   - Schemes: 4
   - Applications: 18
   ...

🔐 Example Login Credentials:
   Student:
     Email: priya.gond@email.com
     Password: password123
```

### Step 5: Start Server
```bash
npm run dev
```

Server starts on `http://localhost:5000`

## 🧪 Test the API

### Test 1: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya.gond@email.com",
    "password": "password123"
  }'
```

You'll receive a JWT token. Copy it for the next requests.

### Test 2: Get Your Profile (Student)
```bash
curl -X GET http://localhost:5000/api/student/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Test 3: Get All Schemes
```bash
curl -X GET http://localhost:5000/api/student/schemes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Test 4: Admin - Get Applications
Login as admin first:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rajesh.kumar@mota.gov.in",
    "password": "password123"
  }'
```

Then get applications:
```bash
curl -X GET http://localhost:5000/api/admin/applications \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN_HERE"
```

### Test 5: Government - Dashboard Summary
Login as government:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "government@mota.gov.in",
    "password": "password123"
  }'
```

Then get dashboard:
```bash
curl -X GET http://localhost:5000/api/gov/dashboard-summary \
  -H "Authorization: Bearer GOV_JWT_TOKEN_HERE"
```

## 🌐 Using Postman or Insomnia

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:5000`
   - `student_token`: (paste from login response)
   - `admin_token`: (paste from login response)
   - `gov_token`: (paste from login response)

2. **Login Request:**
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "priya.gond@email.com",
       "password": "password123"
     }
     ```
   - Save token from response

3. **Protected Request:**
   - Method: GET
   - URL: `{{base_url}}/api/student/me`
   - Headers:
     ```
     Authorization: Bearer {{student_token}}
     ```

## 📱 Frontend Integration

Update your frontend API service to point to the backend:

```javascript
// src/services/api.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Set token
export const setAuthToken = (token: string) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login
export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password
  });
  setAuthToken(response.data.token);
  return response.data;
};

// Get student profile
export const getStudentProfile = async () => {
  const response = await axios.get(`${API_BASE_URL}/student/me`);
  return response.data;
};

// Get applications
export const getApplications = async () => {
  const response = await axios.get(`${API_BASE_URL}/student/applications/my`);
  return response.data;
};
```

## 🐛 Common Issues

### Issue: "MongoNetworkError: connect ECONNREFUSED"
**Solution:** MongoDB is not running
```bash
# Start MongoDB
mongod
```

### Issue: "Port 5000 already in use"
**Solution:** Change port in `.env`
```env
PORT=5001
```

### Issue: "Token is not valid"
**Solution:** Token expired or invalid. Login again to get new token.

### Issue: "Cannot find module"
**Solution:** Dependencies not installed
```bash
npm install
```

## 📊 Database Inspection

### Using MongoDB Compass
1. Download MongoDB Compass: https://www.mongodb.com/products/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `scholarship_db`
4. Browse collections: students, applications, schemes, etc.

### Using Mongo Shell
```bash
# Connect to database
mongosh

# Switch to database
use scholarship_db

# List collections
show collections

# Count students
db.students.countDocuments()

# Find first student
db.students.findOne()

# Find applications by status
db.applications.find({ status: 'selected' })
```

## 🔄 Reset Database

To start fresh:
```bash
# Stop server (Ctrl+C)

# Clear database
mongosh
use scholarship_db
db.dropDatabase()
exit

# Re-seed
npm run seed

# Restart server
npm run dev
```

## 📝 Next Steps

1. **Integrate AI/OCR Service**
   - Find the TODO comment in `routes/student.js`
   - Implement document verification logic
   - Update AI scores and flags

2. **Add Email Notifications**
   - Install nodemailer: `npm install nodemailer`
   - Create email service
   - Send emails on status changes

3. **Add SMS Notifications**
   - Integrate Twilio or similar service
   - Send SMS on important updates

4. **Implement File Storage**
   - Move from local uploads to cloud storage (AWS S3, etc.)
   - Update multer configuration

5. **Add Rate Limiting**
   - Install express-rate-limit
   - Protect against brute force attacks

## 🎯 You're Ready!

Your backend is now running with:
- ✅ 18 students seeded
- ✅ 4 scholarship schemes
- ✅ 18 applications with various statuses
- ✅ 6 admin users
- ✅ Complete audit trail
- ✅ Notifications system
- ✅ All API endpoints working

Start building your frontend integration!
