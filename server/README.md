# AI-Enabled Scholarship & Fellowship Management System - Backend

Backend API for the Ministry of Tribal Affairs (MoTA) scholarship management system. Built with Node.js, Express, MongoDB, and JWT authentication.

## 🚀 Features

- **Multi-role Authentication**: Student, Admin, and Government roles with JWT
- **Custom String IDs**: Uses STU001, APP001, etc. instead of MongoDB ObjectIds
- **Document Management**: File uploads with Multer
- **AI Integration Ready**: Placeholder for OCR/verification services
- **Comprehensive Analytics**: Aggregation pipelines for government dashboard
- **Audit Trail**: Complete history of all administrative actions
- **Notification System**: Real-time notifications for students
- **CSV Export**: Data export functionality for government users

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/scholarship_db
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   CLIENT_URL=http://localhost:5173
   UPLOAD_PATH=./uploads
   MAX_FILE_SIZE=5242880
   SEED_DEFAULT_PASSWORD=password123
   ```

5. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or if using MongoDB service
   sudo systemctl start mongod
   ```

6. **Seed the database:**
   ```bash
   npm run seed
   ```

7. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Login Flow

1. **Register/Login** via `/api/auth/login` or `/api/auth/register`
2. **Receive JWT token** in response
3. **Include token** in all subsequent requests

> 🧪 **Testing every endpoint in Postman?** See **[POSTMAN_TESTING.md](./POSTMAN_TESTING.md)** for request/response examples, seeded test data, and upload instructions.

## 📡 API Routes

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new student | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |

### Student Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/student/schemes` | Get all schemes | Student |
| GET | `/api/student/schemes/:id` | Get scheme by ID | Student |
| GET | `/api/student/me` | Get student profile | Student |
| PUT | `/api/student/me` | Update student profile | Student |
| POST | `/api/student/applications` | Create application | Student |
| PUT | `/api/student/applications/:id/draft` | Auto-save draft | Student |
| GET | `/api/student/applications/my` | Get my applications | Student |
| GET | `/api/student/applications/:id` | Get application by ID | Student |
| PUT | `/api/student/applications/:id/documents` | Attach files to application (multipart, field `documents`) | Student |
| PUT | `/api/student/applications/:id/submit` | Validate & submit application | Student |
| POST | `/api/student/vault/upload` | Advanced upload to Document Vault (multipart, field `files`) | Student |
| GET | `/api/student/vault` | List vault documents | Student |
| PUT | `/api/student/vault/:docId/verify` | Verify vault document | Student |
| DELETE | `/api/student/vault/:docId` | Delete vault document + file | Student |
| GET | `/api/student/disbursals/my` | My disbursals | Student |
| PUT | `/api/student/applications/:id/enrolment` | Confirm enrolment | Student |
| PUT | `/api/student/applications/:id/attendance` | Upload attendance % | Student |
| POST | `/api/student/grievances` | Create grievance | Student |
| GET | `/api/student/grievances/my` | Get my grievances | Student |
| GET | `/api/student/notifications/my` | Get my notifications | Student |
| PUT | `/api/student/notifications/:id/read` | Mark notification read | Student |

### Admin Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/admin/applications` | Get all applications (with filters) | Admin |
| GET | `/api/admin/applications/:id` | Get application by ID | Admin |
| PUT | `/api/admin/applications/:id/status` | Update application status | Admin |
| PUT | `/api/admin/applications/bulk-status` | Bulk update status | Admin |
| GET | `/api/admin/schemes` | Get all schemes | Admin |
| POST | `/api/admin/schemes` | Create new scheme | Admin |
| PUT | `/api/admin/schemes/:id` | Update scheme | Admin |
| GET | `/api/admin/merit-list/:schemeId` | Get merit list | Admin |
| POST | `/api/admin/communications` | Send notifications | Admin |
| GET | `/api/admin/audit-log` | Get audit log | Admin |
| GET | `/api/admin/disbursals` | Get all disbursals | Admin |
| PUT | `/api/admin/disbursals/:id` | Update disbursal | Admin |
| GET | `/api/admin/grievances` | Get all grievances | Admin |
| PUT | `/api/admin/grievances/:id` | Respond to grievance | Admin |

### Government Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/gov/dashboard-summary` | Dashboard analytics | Gov/Admin |
| GET | `/api/gov/scheme-performance` | Scheme performance metrics | Gov/Admin |
| GET | `/api/gov/budget-overview` | Budget overview | Gov/Admin |
| GET | `/api/gov/export?type=applications\|disbursals` | Export CSV | Gov/Admin |

## 🗄️ Database Models

### Student
- Personal details, academic info, bank details
- Guardian contact information
- Document vault (reusable documents)
- Accessibility preferences

### Scheme
- Scholarship details and eligibility criteria
- Machine-readable eligibility checks
- Sample documents with tips
- Quota and deadline information

### Application
- Student and scheme references
- Status tracking with history
- Embedded documents with AI scores
- AI flags and deficiency notices
- Enrolment and attendance tracking

### AdminUser
- Admin role and department
- State assignment

### User (Authentication)
- Links to Student or AdminUser
- JWT authentication
- Role-based access control

### Supporting Models
- **AuditEntry**: Track all admin actions
- **Notification**: Student notifications
- **Disbursal**: Payment tracking
- **Grievance**: Support tickets
- **AttendanceRecord**: Renewal requirements
- **CSCCenter**: Help center locations

## 📁 Project Structure

```
server/
├── config/
│   └── db.js                 # Database connection
├── middleware/
│   ├── authMiddleware.js     # JWT authentication
│   ├── roleMiddleware.js     # Role-based access
│   └── errorHandler.js       # Error handling
├── models/
│   ├── Student.js
│   ├── Scheme.js
│   ├── Application.js
│   ├── AdminUser.js
│   ├── User.js
│   ├── AuditEntry.js
│   ├── Notification.js
│   ├── Disbursal.js
│   ├── Grievance.js
│   ├── AttendanceRecord.js
│   └── CSCCenter.js
├── routes/
│   ├── auth.js
│   ├── student.js
│   ├── admin.js
│   └── gov.js
├── uploads/                  # File uploads directory
├── mockData.js              # Seed data
├── seed.js                  # Database seeder
├── server.js                # Main server file
├── .env.example             # Environment template
├── .env                     # Environment variables (create this)
├── package.json
└── README.md
```

## 🔧 Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Seed database
npm run seed
```

## 📝 Example Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"priya.gond@email.com","password":"password123"}'
```

### Get My Applications (Student)
```bash
curl -X GET http://localhost:5000/api/student/applications/my \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Application Status (Admin)
```bash
curl -X PUT http://localhost:5000/api/admin/applications/APP001/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"selected","remark":"Merit-based selection"}'
```

### Get Dashboard Summary (Government)
```bash
curl -X GET http://localhost:5000/api/gov/dashboard-summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Export Applications as CSV
```bash
curl -X GET "http://localhost:5000/api/gov/export?type=applications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o applications.csv
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access**: Middleware for route protection
- **Input Validation**: express-validator on all routes
- **CORS Protection**: Configurable origin restrictions
- **File Upload Validation**: Type and size restrictions
- **Error Handling**: Centralized error responses

## 🚀 Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure `MONGODB_URI` for production MongoDB
4. Set appropriate `CLIENT_URL`
5. Use process manager (PM2 recommended)
6. Enable HTTPS in production

## 📊 Testing Credentials

After running `npm run seed`, use these credentials:

**Student:**
- Email: `priya.gond@email.com`
- Password: `password123`

**Admin:**
- Email: `rajesh.kumar@mota.gov.in`
- Password: `password123`

**Government:**
- Email: `government@mota.gov.in`
- Password: `password123`

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill existing process: `lsof -ti:5000 | xargs kill`

**Module Not Found:**
- Run `npm install` again
- Clear node_modules: `rm -rf node_modules && npm install`

## 📄 License

ISC

## 👥 Support

For issues and questions, please contact the development team.

---

**Built for Ministry of Tribal Affairs, Government of India**
