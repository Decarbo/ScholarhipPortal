const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import models
const Student = require('./models/Student');
const Scheme = require('./models/Scheme');
const Application = require('./models/Application');
const AdminUser = require('./models/AdminUser');
const AuditEntry = require('./models/AuditEntry');
const Notification = require('./models/Notification');
const Disbursal = require('./models/Disbursal');
const Grievance = require('./models/Grievance');
const AttendanceRecord = require('./models/AttendanceRecord');
const CSCCenter = require('./models/CSCCenter');
const User = require('./models/User');

// Import mock data
const mockData = require('./mockData');

// Map a plain `id` field to the string `_id` expected by the Mongoose schemas.
// Works recursively so nested subdocs (documents, vault docs, aiFlags...) are fixed too.
const mapIds = (obj) => {
  if (Array.isArray(obj)) return obj.map(mapIds);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k === 'id' && typeof v === 'string') out._id = v;
      else out[k] = mapIds(v);
    }
    return out;
  }
  return obj;
};

// Connect to database
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await Student.deleteMany({});
    await Scheme.deleteMany({});
    await Application.deleteMany({});
    await AdminUser.deleteMany({});
    await AuditEntry.deleteMany({});
    await Notification.deleteMany({});
    await Disbursal.deleteMany({});
    await Grievance.deleteMany({});
    await AttendanceRecord.deleteMany({});
    await CSCCenter.deleteMany({});
    await User.deleteMany({});

    // Get default password from environment or use default
    const defaultPassword = process.env.SEED_DEFAULT_PASSWORD || 'password123';

    // Seed Students
    console.log('Seeding students...');
    const students = mockData.students.map(mapIds);
    await Student.insertMany(students);
    console.log(`${students.length} students seeded`);

    // Seed Schemes
    console.log('Seeding schemes...');
    const schemes = mockData.schemes.map(mapIds);
    await Scheme.insertMany(schemes);
    console.log(`${schemes.length} schemes seeded`);

    // Seed Applications
    console.log('Seeding applications...');
    const applications = mockData.applications.map(mapIds);
    await Application.insertMany(applications);
    console.log(`${applications.length} applications seeded`);

    // Seed Admin Users
    console.log('Seeding admin users...');
    const adminUsers = mockData.adminUsers.map(mapIds);
    await AdminUser.insertMany(adminUsers);
    console.log(`${adminUsers.length} admin users seeded`);

    // Seed Audit Entries
    console.log('Seeding audit entries...');
    const auditEntries = mockData.auditLog.map(mapIds);
    await AuditEntry.insertMany(auditEntries);
    console.log(`${auditEntries.length} audit entries seeded`);

    // Seed Notifications
    console.log('Seeding notifications...');
    const notifications = mockData.notifications.map(mapIds);
    await Notification.insertMany(notifications);
    console.log(`${notifications.length} notifications seeded`);

    // Seed Disbursals
    console.log('Seeding disbursals...');
    const disbursals = mockData.disbursals.map(mapIds);
    await Disbursal.insertMany(disbursals);
    console.log(`${disbursals.length} disbursals seeded`);

    // Seed Grievances
    console.log('Seeding grievances...');
    const grievances = mockData.grievances.map(mapIds);
    await Grievance.insertMany(grievances);
    console.log(`${grievances.length} grievances seeded`);

    // Seed Attendance Records
    console.log('Seeding attendance records...');
    const attendanceRecords = mockData.attendanceRecords.map(mapIds);
    await AttendanceRecord.insertMany(attendanceRecords);
    console.log(`${attendanceRecords.length} attendance records seeded`);

    // Seed CSC Centers
    console.log('Seeding CSC centers...');
    const cscCenters = mockData.cscCenters.map(mapIds);
    await CSCCenter.insertMany(cscCenters);
    console.log(`${cscCenters.length} CSC centers seeded`);

    // Create User accounts for authentication
    console.log('Creating user accounts...');

    // Create student users
    const studentUsers = mockData.students.map(student => ({
      _id: student.id,
      email: student.email,
      password: defaultPassword,
      role: 'student'
    }));

    // Create admin users
    const adminUserAccounts = mockData.adminUsers.map(admin => ({
      _id: admin.id,
      email: admin.email,
      password: defaultPassword,
      role: 'admin',
      adminRole: admin.role
    }));

    // Create a government user
    const governmentUser = {
      _id: 'GOV001',
      email: 'government@mota.gov.in',
      password: defaultPassword,
      role: 'government'
    };

    // Save users one-by-one so the pre-save hook hashes passwords
    const allUsers = [...studentUsers, ...adminUserAccounts, governmentUser];
    for (const u of allUsers) {
      await new User(u).save();
    }
    console.log(`${allUsers.length} user accounts created`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Students: ${students.length}`);
    console.log(`   - Schemes: ${schemes.length}`);
    console.log(`   - Applications: ${applications.length}`);
    console.log(`   - Admin Users: ${adminUsers.length}`);
    console.log(`   - Audit Entries: ${auditEntries.length}`);
    console.log(`   - Notifications: ${notifications.length}`);
    console.log(`   - Disbursals: ${disbursals.length}`);
    console.log(`   - Grievances: ${grievances.length}`);
    console.log(`   - Attendance Records: ${attendanceRecords.length}`);
    console.log(`   - CSC Centers: ${cscCenters.length}`);
    console.log(`   - User Accounts: ${studentUsers.length + adminUserAccounts.length + 1}`);

    console.log('\n🔐 Example Login Credentials:');
    console.log('   Student:');
    console.log(`     Email: ${mockData.students[0].email}`);
    console.log(`     Password: ${defaultPassword}`);
    console.log('\n   Admin:');
    console.log(`     Email: ${mockData.adminUsers[0].email}`);
    console.log(`     Password: ${defaultPassword}`);
    console.log('\n   Government:');
    console.log(`     Email: ${governmentUser.email}`);
    console.log(`     Password: ${defaultPassword}`);
    console.log('\n');

    // If seeding an in-memory DB started by this process, keep it alive so a
    // dev-seed-server (same process) can serve the API against it.
    if (process.env.USE_MEMORY_DB === 'true' && !process.env.SKIP_SEED_KEEPALIVE) {
      console.log('ℹ️  In-memory DB seeded; keeping process alive.');
      return; // do not exit
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function only when executed directly (not when required by dev-seed-server)
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
