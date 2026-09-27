// Mock data for AI-Enabled Scholarship & Fellowship Management System
// TODO: Replace with real API calls - structure matches expected API responses

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharNumber: string;
  stCertificateNumber: string;
  tribeName: string;
  state: string;
  district: string;
  familyIncome: number;
  bankAccountNumber: string;
  bankName: string;
  ifscCode: string;
  courseName: string;
  courseLevel: string;
  institution: string;
  yearOfStudy: number;
  // NEW: Guardian/parent contact
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  // NEW: Accessibility preferences
  preferredLanguage: string;
  voiceInputEnabled: boolean;
  // NEW: Document vault
  documentVault: VaultDocument[];
  // NEW: Bank verification status
  bankVerified: boolean;
  // NEW: Enrolment status
  enrolmentConfirmed: boolean;
}

export interface VaultDocument {
  id: string;
  name: string;
  type: string;
  category:
    | "st_certificate"
    | "income_certificate"
    | "marksheet"
    | "bank_passbook"
    | "aadhaar"
    | "passport"
    | "bonafide"
    | "research_proposal"
    | "other";
  status: "verified" | "pending" | "flagged" | "expired";
  uploadDate: string;
  expiryDate?: string;
  aiScore: number;
  usedInApplications: string[]; // application IDs where this doc was used
  sampleAvailable: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  studentName: string;
  schemeId: string;
  schemeName: string;
  status:
    | "draft"
    | "submitted"
    | "under_scrutiny"
    | "screening"
    | "selected"
    | "waitlisted"
    | "rejected";
  state: string;
  category: string;
  submittedDate: string;
  lastUpdated: string;
  documents: Document[];
  vaultDocumentIds: string[]; // References to vault documents
  aiFlags: AIFlag[];
  deficiencyNotices: DeficiencyNotice[];
  amount: number;
  // NEW: Plain language reason for rejection/flag
  plainReason?: string;
  // NEW: Auto-save draft data
  draftProgress: number; // 0-100
  draftLastSaved?: string;
  // NEW: Enrolment confirmation
  enrolmentConfirmed: boolean;
  enrolmentDate?: string;
  // NEW: Attendance/progress for renewal
  attendancePercentage?: number;
  progressReportUploaded?: boolean;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  status: "verified" | "pending" | "flagged" | "missing";
  uploadDate: string;
  aiScore: number;
  aiFeedback?: string; // NEW: Instant AI feedback message
  sampleUrl?: string; // NEW: Link to sample/example document
}

export interface AIFlag {
  id: string;
  type:
    | "ocr_mismatch"
    | "missing_field"
    | "eligibility_concern"
    | "duplicate_detected"
    | "blurry_image"
    | "expired_document";
  message: string;
  plainLanguageMessage: string; // NEW: Simple explanation for students
  severity: "low" | "medium" | "high";
  createdAt: string;
  suggestion?: string; // NEW: AI suggestion to fix
}

export interface DeficiencyNotice {
  id: string;
  documentId: string;
  message: string;
  plainLanguageMessage: string; // NEW: Simple explanation
  issuedDate: string;
  resolved: boolean;
  reuploadUrl?: string;
}

export interface Scheme {
  id: string;
  name: string;
  fullName: string;
  description: string;
  eligibility: string[];
  eligibilityCheck: EligibilityCheck[]; // NEW: Machine-readable eligibility rules
  requiredDocuments: string[];
  amount: number;
  duration: string;
  deadline: string;
  quota: number;
  activeApplications: number;
  // NEW: Sample documents
  sampleDocuments: SampleDocument[];
  // NEW: Renewal info
  renewable: boolean;
  renewalDeadline?: string;
}

export interface EligibilityCheck {
  field: string;
  operator: "equals" | "greater_than" | "less_than" | "contains" | "in";
  value: any;
  label: string;
}

export interface SampleDocument {
  id: string;
  name: string;
  type: string;
  description: string;
  tips: string[];
  commonMistakes: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role:
    | "scrutiny_officer"
    | "screening_committee"
    | "nodal_officer"
    | "super_admin";
  state: string;
  department: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  applicationId: string;
  studentName: string;
  timestamp: string;
  details: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | "status_change"
    | "deadline"
    | "deficiency"
    | "disbursal"
    | "general"
    | "renewal_reminder"
    | "sms_alert";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  // NEW: SMS delivery status
  smsSent?: boolean;
  emailSent?: boolean;
}

export interface Disbursal {
  id: string;
  applicationId: string;
  studentName: string;
  amount: number;
  status: "processed" | "pending" | "failed";
  transactionId: string;
  date: string;
  bankReference: string;
}

export interface Grievance {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdated: string;
  response?: string;
  // NEW: CSC/Assistance request
  needsAssistance?: boolean;
  assistanceType?: string;
}

export interface AttendanceRecord {
  id: string;
  applicationId: string;
  studentId: string;
  year: string;
  percentage: number;
  uploadedDate: string;
  verified: boolean;
}

export interface CSCCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  phone: string;
  available: boolean;
}

// ============ MOCK DATA ============

export const students: Student[] = [
  {
    id: "STU001",
    name: "Priya Gond",
    email: "priya.gond@email.com",
    phone: "9876543210",
    aadharNumber: "1234-5678-9012",
    stCertificateNumber: "ST/MP/2023/001",
    tribeName: "Gond",
    state: "Madhya Pradesh",
    district: "Mandla",
    familyIncome: 180000,
    bankAccountNumber: "1234567890",
    bankName: "State Bank of India",
    ifscCode: "SBIN0001234",
    courseName: "B.Tech Computer Science",
    courseLevel: "Graduation",
    institution: "Maulana Azad National Institute of Technology",
    yearOfStudy: 2,
    guardianName: "Ramu Gond",
    guardianRelation: "Father",
    guardianPhone: "9876543299",
    guardianEmail: "ramu.gond@email.com",
    preferredLanguage: "hi",
    voiceInputEnabled: true,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [
      {
        id: "VDOC001",
        name: "ST_Certificate_Priya.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-06-15",
        expiryDate: "2030-06-15",
        aiScore: 98,
        usedInApplications: ["APP001", "APP009"],
        sampleAvailable: true,
      },
      {
        id: "VDOC002",
        name: "Income_Certificate_2025.pdf",
        type: "application/pdf",
        category: "income_certificate",
        status: "verified",
        uploadDate: "2025-08-20",
        expiryDate: "2026-08-20",
        aiScore: 95,
        usedInApplications: ["APP001"],
        sampleAvailable: true,
      },
      {
        id: "VDOC003",
        name: "Marksheet_Sem4.pdf",
        type: "application/pdf",
        category: "marksheet",
        status: "verified",
        uploadDate: "2025-09-10",
        aiScore: 92,
        usedInApplications: ["APP001"],
        sampleAvailable: true,
      },
      {
        id: "VDOC004",
        name: "Aadhaar_Card.pdf",
        type: "application/pdf",
        category: "aadhaar",
        status: "verified",
        uploadDate: "2025-06-15",
        aiScore: 99,
        usedInApplications: ["APP001"],
        sampleAvailable: false,
      },
      {
        id: "VDOC005",
        name: "Bank_Passbook_SBI.pdf",
        type: "application/pdf",
        category: "bank_passbook",
        status: "verified",
        uploadDate: "2025-06-15",
        aiScore: 96,
        usedInApplications: ["APP001"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU002",
    name: "Ramesh Bhil",
    email: "ramesh.bhil@email.com",
    phone: "9876543211",
    aadharNumber: "2345-6789-0123",
    stCertificateNumber: "ST/RJ/2023/045",
    tribeName: "Bhil",
    state: "Rajasthan",
    district: "Udaipur",
    familyIncome: 150000,
    bankAccountNumber: "2345678901",
    bankName: "Bank of Baroda",
    ifscCode: "BARB0002345",
    courseName: "M.A. Sociology",
    courseLevel: "Post Graduation",
    institution: "University of Rajasthan",
    yearOfStudy: 1,
    guardianName: "Sita Bhil",
    guardianRelation: "Mother",
    guardianPhone: "9876543298",
    guardianEmail: "sita.bhil@email.com",
    preferredLanguage: "en",
    voiceInputEnabled: false,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [
      {
        id: "VDOC006",
        name: "ST_Certificate_Ramesh.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-07-10",
        aiScore: 96,
        usedInApplications: ["APP002"],
        sampleAvailable: true,
      },
      {
        id: "VDOC007",
        name: "Passport_Copy.jpg",
        type: "image/jpeg",
        category: "passport",
        status: "flagged",
        uploadDate: "2025-12-01",
        aiScore: 45,
        usedInApplications: ["APP002"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU003",
    name: "Lakshmi Santhal",
    email: "lakshmi.santhal@email.com",
    phone: "9876543212",
    aadharNumber: "3456-7890-1234",
    stCertificateNumber: "ST/JH/2023/089",
    tribeName: "Santhal",
    state: "Jharkhand",
    district: "Dumka",
    familyIncome: 120000,
    bankAccountNumber: "3456789012",
    bankName: "Punjab National Bank",
    ifscCode: "PUNB0003456",
    courseName: "B.Sc Nursing",
    courseLevel: "Graduation",
    institution: "Ranchi University",
    yearOfStudy: 3,
    guardianName: "Mohan Santhal",
    guardianRelation: "Father",
    guardianPhone: "9876543297",
    guardianEmail: "mohan.santhal@email.com",
    preferredLanguage: "hi",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [
      {
        id: "VDOC008",
        name: "ST_Certificate_Lakshmi.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-05-20",
        aiScore: 97,
        usedInApplications: ["APP003"],
        sampleAvailable: true,
      },
      {
        id: "VDOC009",
        name: "Income_Certificate_2025.pdf",
        type: "application/pdf",
        category: "income_certificate",
        status: "verified",
        uploadDate: "2025-05-20",
        aiScore: 94,
        usedInApplications: ["APP003"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU004",
    name: "Dhruv Munda",
    email: "dhruv.munda@email.com",
    phone: "9876543213",
    aadharNumber: "4567-8901-2345",
    stCertificateNumber: "ST/OD/2023/112",
    tribeName: "Munda",
    state: "Odisha",
    district: "Sundargarh",
    familyIncome: 200000,
    bankAccountNumber: "4567890123",
    bankName: "Indian Bank",
    ifscCode: "IDIB0004567",
    courseName: "Ph.D Anthropology",
    courseLevel: "Doctorate",
    institution: "Utkal University",
    yearOfStudy: 2,
    guardianName: "Sita Munda",
    guardianRelation: "Mother",
    guardianPhone: "9876543296",
    guardianEmail: "",
    preferredLanguage: "or",
    voiceInputEnabled: true,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [
      {
        id: "VDOC010",
        name: "ST_Certificate_Dhruv.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-04-10",
        aiScore: 99,
        usedInApplications: ["APP004"],
        sampleAvailable: true,
      },
      {
        id: "VDOC011",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        category: "income_certificate",
        status: "verified",
        uploadDate: "2025-04-10",
        aiScore: 96,
        usedInApplications: ["APP004"],
        sampleAvailable: true,
      },
      {
        id: "VDOC012",
        name: "Research_Proposal.pdf",
        type: "application/pdf",
        category: "research_proposal",
        status: "verified",
        uploadDate: "2025-11-10",
        aiScore: 91,
        usedInApplications: ["APP004"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU005",
    name: "Meena Khasi",
    email: "meena.khasi@email.com",
    phone: "9876543214",
    aadharNumber: "5678-9012-3456",
    stCertificateNumber: "ST/ML/2023/034",
    tribeName: "Khasi",
    state: "Meghalaya",
    district: "East Khasi Hills",
    familyIncome: 220000,
    bankAccountNumber: "5678901234",
    bankName: "Union Bank",
    ifscCode: "UBIN0005678",
    courseName: "MBA",
    courseLevel: "Post Graduation",
    institution: "North Eastern Hill University",
    yearOfStudy: 1,
    guardianName: "Thomas Khasi",
    guardianRelation: "Father",
    guardianPhone: "9876543295",
    guardianEmail: "thomas.khasi@email.com",
    preferredLanguage: "en",
    voiceInputEnabled: false,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [],
  },
  {
    id: "STU006",
    name: "Arjun Oraon",
    email: "arjun.oraon@email.com",
    phone: "9876543215",
    aadharNumber: "6789-0123-4567",
    stCertificateNumber: "ST/CG/2023/067",
    tribeName: "Oraon",
    state: "Chhattisgarh",
    district: "Jashpur",
    familyIncome: 160000,
    bankAccountNumber: "6789012345",
    bankName: "Central Bank of India",
    ifscCode: "CBIN0006789",
    courseName: "B.A. Tribal Studies",
    courseLevel: "Graduation",
    institution: "Guru Ghasidas University",
    yearOfStudy: 2,
    guardianName: "Manglu Oraon",
    guardianRelation: "Uncle",
    guardianPhone: "9876543294",
    guardianEmail: "",
    preferredLanguage: "hi",
    voiceInputEnabled: true,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [
      {
        id: "VDOC013",
        name: "ST_Certificate_Arjun.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "pending",
        uploadDate: "2026-01-20",
        aiScore: 0,
        usedInApplications: ["APP006"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU007",
    name: "Sunita Naga",
    email: "sunita.naga@email.com",
    phone: "9876543216",
    aadharNumber: "7890-1234-5678",
    stCertificateNumber: "ST/NL/2023/023",
    tribeName: "Naga",
    state: "Nagaland",
    district: "Kohima",
    familyIncome: 190000,
    bankAccountNumber: "7890123456",
    bankName: "Axis Bank",
    ifscCode: "UTIB0007890",
    courseName: "M.Tech Data Science",
    courseLevel: "Post Graduation",
    institution: "IIT Guwahati",
    yearOfStudy: 1,
    guardianName: "Imchen Naga",
    guardianRelation: "Father",
    guardianPhone: "9876543293",
    guardianEmail: "imchen.naga@email.com",
    preferredLanguage: "en",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [
      {
        id: "VDOC014",
        name: "ST_Certificate_Sunita.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-03-15",
        aiScore: 97,
        usedInApplications: ["APP007"],
        sampleAvailable: true,
      },
      {
        id: "VDOC015",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        category: "income_certificate",
        status: "verified",
        uploadDate: "2025-03-15",
        aiScore: 93,
        usedInApplications: ["APP007"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU008",
    name: "Vikram Toda",
    email: "vikram.toda@email.com",
    phone: "9876543217",
    aadharNumber: "8901-2345-6789",
    stCertificateNumber: "ST/UK/2023/056",
    tribeName: "Toda",
    state: "Uttarakhand",
    district: "Dehradun",
    familyIncome: 170000,
    bankAccountNumber: "8901234567",
    bankName: "HDFC Bank",
    ifscCode: "HDFC0008901",
    courseName: "B.Com",
    courseLevel: "Graduation",
    institution: "HNB Garhwal University",
    yearOfStudy: 3,
    guardianName: "Ravi Toda",
    guardianRelation: "Father",
    guardianPhone: "9876543292",
    guardianEmail: "ravi.toda@email.com",
    preferredLanguage: "hi",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: false,
    documentVault: [
      {
        id: "VDOC016",
        name: "ST_Certificate_Vikram.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-10-05",
        aiScore: 96,
        usedInApplications: ["APP008"],
        sampleAvailable: true,
      },
      {
        id: "VDOC017",
        name: "Marksheet_Class12.pdf",
        type: "application/pdf",
        category: "marksheet",
        status: "flagged",
        uploadDate: "2026-01-10",
        aiScore: 52,
        usedInApplications: ["APP008"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU009",
    name: "Anita Bodo",
    email: "anita.bodo@email.com",
    phone: "9876543218",
    aadharNumber: "9012-3456-7890",
    stCertificateNumber: "ST/AS/2023/078",
    tribeName: "Bodo",
    state: "Assam",
    district: "Kokrajhar",
    familyIncome: 140000,
    bankAccountNumber: "9012345678",
    bankName: "Canara Bank",
    ifscCode: "CNRB0009012",
    courseName: "M.Phil Economics",
    courseLevel: "Post Graduation",
    institution: "Tezpur University",
    yearOfStudy: 1,
    guardianName: "Bireswar Bodo",
    guardianRelation: "Father",
    guardianPhone: "9876543291",
    guardianEmail: "bireswar.bodo@email.com",
    preferredLanguage: "as",
    voiceInputEnabled: true,
    bankVerified: true,
    enrolmentConfirmed: false,
    documentVault: [
      {
        id: "VDOC018",
        name: "ST_Certificate_Anita.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-07-20",
        aiScore: 95,
        usedInApplications: ["APP009"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU010",
    name: "Rajan Rathwa",
    email: "rajan.rathwa@email.com",
    phone: "9876543219",
    aadharNumber: "0123-4567-8901",
    stCertificateNumber: "ST/GJ/2023/091",
    tribeName: "Rathwa",
    state: "Gujarat",
    district: "Chhota Udaipur",
    familyIncome: 130000,
    bankAccountNumber: "0123456789",
    bankName: "Indian Overseas Bank",
    ifscCode: "IOBA0000123",
    courseName: "B.Tech Mechanical",
    courseLevel: "Graduation",
    institution: "SVNIT Surat",
    yearOfStudy: 4,
    guardianName: "Jiva Rathwa",
    guardianRelation: "Father",
    guardianPhone: "9876543290",
    guardianEmail: "",
    preferredLanguage: "gu",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [
      {
        id: "VDOC019",
        name: "ST_Certificate_Rajan.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "verified",
        uploadDate: "2025-09-01",
        aiScore: 98,
        usedInApplications: ["APP010"],
        sampleAvailable: true,
      },
      {
        id: "VDOC020",
        name: "Marksheet.pdf",
        type: "application/pdf",
        category: "marksheet",
        status: "verified",
        uploadDate: "2025-09-01",
        aiScore: 94,
        usedInApplications: ["APP010"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU011",
    name: "Deepa Kurumba",
    email: "deepa.kurumba@email.com",
    phone: "9876543220",
    aadharNumber: "1122-3344-5566",
    stCertificateNumber: "ST/TN/2023/015",
    tribeName: "Kurumba",
    state: "Tamil Nadu",
    district: "Nilgiris",
    familyIncome: 165000,
    bankAccountNumber: "1122334455",
    bankName: "Indian Bank",
    ifscCode: "IDIB0001122",
    courseName: "M.Sc Environmental Science",
    courseLevel: "Post Graduation",
    institution: "Bharathiar University",
    yearOfStudy: 1,
    guardianName: "Kannan Kurumba",
    guardianRelation: "Father",
    guardianPhone: "9876543289",
    guardianEmail: "kannan.kurumba@email.com",
    preferredLanguage: "ta",
    voiceInputEnabled: false,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [],
  },
  {
    id: "STU012",
    name: "Suresh Savara",
    email: "suresh.savara@email.com",
    phone: "9876543221",
    aadharNumber: "2233-4455-6677",
    stCertificateNumber: "ST/AP/2023/042",
    tribeName: "Savara",
    state: "Andhra Pradesh",
    district: "Visakhapatnam",
    familyIncome: 175000,
    bankAccountNumber: "2233445566",
    bankName: "Andhra Bank",
    ifscCode: "ANDB0002233",
    courseName: "B.Pharm",
    courseLevel: "Graduation",
    institution: "Andhra University",
    yearOfStudy: 2,
    guardianName: "Lakshmi Savara",
    guardianRelation: "Mother",
    guardianPhone: "9876543288",
    guardianEmail: "",
    preferredLanguage: "te",
    voiceInputEnabled: true,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [
      {
        id: "VDOC021",
        name: "ST_Certificate_Suresh.pdf",
        type: "application/pdf",
        category: "st_certificate",
        status: "pending",
        uploadDate: "2026-01-22",
        aiScore: 0,
        usedInApplications: ["APP012"],
        sampleAvailable: true,
      },
    ],
  },
  {
    id: "STU013",
    name: "Kaviti Kondh",
    email: "kaviti.kondh@email.com",
    phone: "9876543222",
    aadharNumber: "3344-5566-7788",
    stCertificateNumber: "ST/OD/2023/134",
    tribeName: "Kondh",
    state: "Odisha",
    district: "Kandhamal",
    familyIncome: 110000,
    bankAccountNumber: "3344556677",
    bankName: "UCO Bank",
    ifscCode: "UCBA0003344",
    courseName: "B.Ed",
    courseLevel: "Graduation",
    institution: "Sambalpur University",
    yearOfStudy: 1,
    guardianName: "Bhima Kondh",
    guardianRelation: "Father",
    guardianPhone: "9876543287",
    guardianEmail: "bhima.kondh@email.com",
    preferredLanguage: "or",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [],
  },
  {
    id: "STU014",
    name: "Mohan Garo",
    email: "mohan.garo@email.com",
    phone: "9876543223",
    aadharNumber: "4455-6677-8899",
    stCertificateNumber: "ST/ML/2023/067",
    tribeName: "Garo",
    state: "Meghalaya",
    district: "West Garo Hills",
    familyIncome: 195000,
    bankAccountNumber: "4455667788",
    bankName: "State Bank of India",
    ifscCode: "SBIN0004455",
    courseName: "LLB",
    courseLevel: "Graduation",
    institution: "NEHU Tura Campus",
    yearOfStudy: 2,
    guardianName: "Ruping Garo",
    guardianRelation: "Father",
    guardianPhone: "9876543286",
    guardianEmail: "ruping.garo@email.com",
    preferredLanguage: "en",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [],
  },
  {
    id: "STU015",
    name: "Pallavi Maria",
    email: "pallavi.maria@email.com",
    phone: "9876543224",
    aadharNumber: "5566-7788-9900",
    stCertificateNumber: "ST/JH/2023/156",
    tribeName: "Asur",
    state: "Jharkhand",
    district: "Palamu",
    familyIncome: 125000,
    bankAccountNumber: "5566778899",
    bankName: "Bank of India",
    ifscCode: "BKID0005566",
    courseName: "M.Tech Civil Engineering",
    courseLevel: "Post Graduation",
    institution: "BIT Mesra",
    yearOfStudy: 1,
    guardianName: "Sukhdev Maria",
    guardianRelation: "Father",
    guardianPhone: "9876543285",
    guardianEmail: "sukhdev.maria@email.com",
    preferredLanguage: "hi",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [],
  },
  {
    id: "STU016",
    name: "Tara Irula",
    email: "tara.irula@email.com",
    phone: "9876543225",
    aadharNumber: "6677-8899-0011",
    stCertificateNumber: "ST/TN/2023/089",
    tribeName: "Irula",
    state: "Tamil Nadu",
    district: "Kanchipuram",
    familyIncome: 135000,
    bankAccountNumber: "6677889900",
    bankName: "Karur Vysya Bank",
    ifscCode: "KVBL0006677",
    courseName: "B.Sc Agriculture",
    courseLevel: "Graduation",
    institution: "TNAU",
    yearOfStudy: 3,
    guardianName: "Muthu Irula",
    guardianRelation: "Father",
    guardianPhone: "9876543284",
    guardianEmail: "",
    preferredLanguage: "ta",
    voiceInputEnabled: true,
    bankVerified: true,
    enrolmentConfirmed: true,
    documentVault: [],
  },
  {
    id: "STU017",
    name: "Bhim Sahariya",
    email: "bhim.sahariya@email.com",
    phone: "9876543226",
    aadharNumber: "7788-9900-1122",
    stCertificateNumber: "ST/MP/2023/178",
    tribeName: "Sahariya",
    state: "Madhya Pradesh",
    district: "Morena",
    familyIncome: 100000,
    bankAccountNumber: "7788990011",
    bankName: "Punjab National Bank",
    ifscCode: "PUNB0007788",
    courseName: "B.A.",
    courseLevel: "Graduation",
    institution: "Jiwaji University",
    yearOfStudy: 1,
    guardianName: "Kalu Sahariya",
    guardianRelation: "Father",
    guardianPhone: "9876543283",
    guardianEmail: "",
    preferredLanguage: "hi",
    voiceInputEnabled: true,
    bankVerified: false,
    enrolmentConfirmed: false,
    documentVault: [],
  },
  {
    id: "STU018",
    name: "Nirmala Chakma",
    email: "nirmala.chakma@email.com",
    phone: "9876543227",
    aadharNumber: "8899-0011-2233",
    stCertificateNumber: "ST/TR/2023/023",
    tribeName: "Chakma",
    state: "Tripura",
    district: "West Tripura",
    familyIncome: 185000,
    bankAccountNumber: "8899001122",
    bankName: "UCO Bank",
    ifscCode: "UCBA0008899",
    courseName: "M.A. English",
    courseLevel: "Post Graduation",
    institution: "Tripura University",
    yearOfStudy: 2,
    guardianName: "Bikash Chakma",
    guardianRelation: "Father",
    guardianPhone: "9876543282",
    guardianEmail: "bikash.chakma@email.com",
    preferredLanguage: "bn",
    voiceInputEnabled: false,
    bankVerified: true,
    enrolmentConfirmed: false,
    documentVault: [],
  },
];

export const schemes: Scheme[] = [
  {
    id: "SCH001",
    name: "NFST",
    fullName: "National Fellowship for ST Students",
    description:
      "Provides fellowships to ST students for pursuing M.Phil and Ph.D. courses in sciences, social sciences, and humanities. Aims to build research capacity among tribal communities.",
    eligibility: [
      "Must belong to Scheduled Tribe",
      "Admitted to M.Phil/Ph.D program",
      "Annual family income below ₹2.5 lakh",
      "Minimum 55% in qualifying examination",
      "Age below 35 years",
    ],
    eligibilityCheck: [
      {
        field: "familyIncome",
        operator: "less_than",
        value: 250000,
        label: "Family income below ₹2.5 lakh",
      },
      {
        field: "courseLevel",
        operator: "in",
        value: ["Post Graduation", "Doctorate"],
        label: "M.Phil or Ph.D program",
      },
    ],
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate",
      "Academic Marksheet",
      "Research Proposal",
      "Guide Acceptance Letter",
      "Aadhaar Card",
      "Bank Passbook",
    ],
    amount: 31000,
    duration: "2 years (JRF) + 3 years (SRF)",
    deadline: "2026-03-31",
    quota: 500,
    activeApplications: 342,
    renewable: true,
    renewalDeadline: "2026-06-30",
    sampleDocuments: [
      {
        id: "SD001",
        name: "Income Certificate Sample",
        type: "pdf",
        description:
          "Sample of a correctly filled income certificate issued by Tehsildar",
        tips: [
          "Must be issued by competent authority",
          "Should clearly show annual income",
          "Must be less than 1 year old",
        ],
        commonMistakes: [
          "Income mentioned in words and figures don't match",
          "Certificate older than 1 year",
          "Not signed by issuing authority",
        ],
      },
      {
        id: "SD002",
        name: "Research Proposal Sample",
        type: "pdf",
        description: "Example of a well-structured research proposal for NFST",
        tips: [
          "Clearly state research objectives",
          "Include methodology section",
          "Keep within 5-10 pages",
        ],
        commonMistakes: [
          "Too vague objectives",
          "No literature review",
          "Missing bibliography",
        ],
      },
    ],
  },
  {
    id: "SCH002",
    name: "NOS",
    fullName: "National Overseas Scholarship",
    description:
      "Financial support for meritorious ST students for pursuing Master's, Ph.D, and Post-Doctoral programs at reputed overseas universities.",
    eligibility: [
      "Must belong to Scheduled Tribe",
      "Age between 20-35 years",
      "Graduation with minimum 55% marks",
      "Annual family income below ₹2.5 lakh",
      "Valid passport",
      "Admission/offer letter from foreign university",
    ],
    eligibilityCheck: [
      {
        field: "familyIncome",
        operator: "less_than",
        value: 250000,
        label: "Family income below ₹2.5 lakh",
      },
      {
        field: "courseLevel",
        operator: "in",
        value: ["Post Graduation", "Doctorate"],
        label: "Master's, Ph.D, or Post-Doc",
      },
    ],
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate",
      "Passport Copy",
      "University Admission Letter",
      "Academic Transcripts",
      "Statement of Purpose",
      "Aadhaar Card",
      "Bank Passbook",
    ],
    amount: 1500000,
    duration: "As per course duration (max 4 years)",
    deadline: "2026-06-30",
    quota: 100,
    activeApplications: 78,
    renewable: false,
    sampleDocuments: [
      {
        id: "SD003",
        name: "Passport Copy Sample",
        type: "image",
        description: "How to scan your passport correctly",
        tips: [
          "Scan both front and back pages",
          "Ensure name is clearly visible",
          "Use 300 DPI resolution",
        ],
        commonMistakes: [
          "Blurry or dark scan",
          "Name page not fully visible",
          "Wrong file format",
        ],
      },
      {
        id: "SD004",
        name: "Statement of Purpose Sample",
        type: "pdf",
        description: "Example SOP for overseas scholarship",
        tips: [
          "Be specific about your goals",
          "Connect to your tribal background",
          "Explain why this university",
        ],
        commonMistakes: [
          "Generic statements",
          "No connection to tribal community",
          "Too long (>2 pages)",
        ],
      },
    ],
  },
  {
    id: "SCH003",
    name: "NSTPS",
    fullName: "National ST Pre-Matric Scholarship",
    description:
      "Scholarship for ST students studying in classes IX and X to support their education and reduce dropout rates at the secondary level.",
    eligibility: [
      "Must belong to Scheduled Tribe",
      "Studying in class IX or X",
      "Parents annual income below ₹2.5 lakh",
      "Minimum 55% marks in previous examination",
      "Attending government/recognized school",
    ],
    eligibilityCheck: [
      {
        field: "familyIncome",
        operator: "less_than",
        value: 250000,
        label: "Family income below ₹2.5 lakh",
      },
      {
        field: "yearOfStudy",
        operator: "less_than",
        value: 3,
        label: "Class IX or X",
      },
    ],
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate",
      "Previous Year Marksheet",
      "School Bonafide Certificate",
      "Aadhaar Card",
      "Bank Passbook (parent/student)",
    ],
    amount: 7500,
    duration: "1 year (renewable)",
    deadline: "2026-09-30",
    quota: 5000,
    activeApplications: 3200,
    renewable: true,
    renewalDeadline: "2026-08-31",
    sampleDocuments: [
      {
        id: "SD005",
        name: "Bonafide Certificate Sample",
        type: "pdf",
        description: "Sample bonafide certificate from school",
        tips: [
          "Must be on school letterhead",
          "Signed by principal",
          "Include class and section",
        ],
        commonMistakes: [
          "Not on letterhead",
          "Missing school seal",
          "Wrong class mentioned",
        ],
      },
    ],
  },
  {
    id: "SCH004",
    name: "NSTMS",
    fullName: "National ST Merit Scholarship",
    description:
      "Merit-based scholarship for ST students pursuing higher education (class XI onwards) to encourage academic excellence.",
    eligibility: [
      "Must belong to Scheduled Tribe",
      "Studying in class XI or above",
      "Annual family income below ₹6 lakh",
      "Minimum 75% marks in previous examination",
      "Not availing any other scholarship",
    ],
    eligibilityCheck: [
      {
        field: "familyIncome",
        operator: "less_than",
        value: 600000,
        label: "Family income below ₹6 lakh",
      },
    ],
    requiredDocuments: [
      "ST Certificate",
      "Income Certificate",
      "Academic Marksheet",
      "Bonafide Certificate",
      "Aadhaar Card",
      "Bank Passbook",
    ],
    amount: 12000,
    duration: "1 year (renewable)",
    deadline: "2026-10-31",
    quota: 3000,
    activeApplications: 2100,
    renewable: true,
    renewalDeadline: "2026-09-30",
    sampleDocuments: [
      {
        id: "SD006",
        name: "Marksheet Sample",
        type: "image",
        description: "How to scan marksheet correctly",
        tips: [
          "Scan at 300 DPI",
          "Ensure all marks are readable",
          "Include both sides if needed",
        ],
        commonMistakes: ["Blurry text", "Cut off edges", "Wrong orientation"],
      },
    ],
  },
];

export const applications: Application[] = [
  {
    id: "APP001",
    studentId: "STU001",
    studentName: "Priya Gond",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "selected",
    state: "Madhya Pradesh",
    category: "General ST",
    submittedDate: "2025-11-15",
    lastUpdated: "2026-01-20",
    documents: [
      {
        id: "DOC001",
        name: "ST_Certificate_Priya.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-15",
        aiScore: 98,
      },
      {
        id: "DOC002",
        name: "Income_Certificate_2025.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-15",
        aiScore: 95,
      },
      {
        id: "DOC003",
        name: "Marksheet_Sem4.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-15",
        aiScore: 92,
      },
      {
        id: "DOC004",
        name: "Research_Proposal.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-15",
        aiScore: 88,
      },
    ],
    vaultDocumentIds: ["VDOC001", "VDOC002", "VDOC003"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-22",
    attendancePercentage: 88,
    progressReportUploaded: true,
  },
  {
    id: "APP002",
    studentId: "STU002",
    studentName: "Ramesh Bhil",
    schemeId: "SCH002",
    schemeName: "NOS",
    status: "under_scrutiny",
    state: "Rajasthan",
    category: "General ST",
    submittedDate: "2025-12-01",
    lastUpdated: "2026-01-18",
    documents: [
      {
        id: "DOC005",
        name: "ST_Certificate_Ramesh.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-01",
        aiScore: 96,
      },
      {
        id: "DOC006",
        name: "Passport_Copy.jpg",
        type: "image/jpeg",
        status: "flagged",
        uploadDate: "2025-12-01",
        aiScore: 45,
        aiFeedback:
          "Your passport scan is too blurry. The name is not clearly readable. Please scan at higher resolution (300 DPI) and ensure good lighting.",
        sampleUrl: "/samples/passport_sample.pdf",
      },
      {
        id: "DOC007",
        name: "Admission_Letter_MIT.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2025-12-01",
        aiScore: 72,
        aiFeedback:
          "University ranking is not mentioned. Please include QS/THE ranking in your upload.",
      },
    ],
    vaultDocumentIds: ["VDOC006", "VDOC007"],
    aiFlags: [
      {
        id: "FLG001",
        type: "ocr_mismatch",
        message: "Passport name does not match application name",
        plainLanguageMessage:
          "The name on your passport looks different from what you entered in the form. This might be because your passport has your full name with middle name.",
        severity: "high",
        createdAt: "2026-01-10",
        suggestion:
          "Upload a self-attated affidavit or re-scan passport with full name visible",
      },
      {
        id: "FLG002",
        type: "missing_field",
        message: "University ranking not mentioned in admission letter",
        plainLanguageMessage:
          "Your admission letter doesn't show the university's world ranking. We need this to verify the university is among the top 500.",
        severity: "medium",
        createdAt: "2026-01-12",
        suggestion:
          "Upload a separate document showing university ranking from QS or THE website",
      },
    ],
    deficiencyNotices: [
      {
        id: "DEF001",
        documentId: "DOC006",
        message: "Please re-upload passport with clear name visibility",
        plainLanguageMessage:
          "We cannot read your name clearly on the passport copy you uploaded. Please take a new photo or scan with better lighting and upload again.",
        issuedDate: "2026-01-12",
        resolved: false,
        reuploadUrl: "/reupload/DOC006",
      },
    ],
    amount: 1500000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP003",
    studentId: "STU003",
    studentName: "Lakshmi Santhal",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "screening",
    state: "Jharkhand",
    category: "General ST",
    submittedDate: "2025-11-20",
    lastUpdated: "2026-01-15",
    documents: [
      {
        id: "DOC008",
        name: "ST_Certificate_Lakshmi.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-20",
        aiScore: 97,
      },
      {
        id: "DOC009",
        name: "Income_Certificate_2025.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-20",
        aiScore: 94,
      },
      {
        id: "DOC010",
        name: "Guide_Acceptance.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-20",
        aiScore: 90,
      },
    ],
    vaultDocumentIds: ["VDOC008", "VDOC009"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: false,
    attendancePercentage: 92,
    progressReportUploaded: false,
  },
  {
    id: "APP004",
    studentId: "STU004",
    studentName: "Dhruv Munda",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "selected",
    state: "Odisha",
    category: "General ST",
    submittedDate: "2025-11-10",
    lastUpdated: "2026-01-22",
    documents: [
      {
        id: "DOC011",
        name: "ST_Certificate_Dhruv.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-10",
        aiScore: 99,
      },
      {
        id: "DOC012",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-10",
        aiScore: 96,
      },
      {
        id: "DOC013",
        name: "Research_Proposal.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-10",
        aiScore: 91,
      },
    ],
    vaultDocumentIds: ["VDOC010", "VDOC011", "VDOC012"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-25",
    attendancePercentage: 85,
    progressReportUploaded: true,
  },
  {
    id: "APP005",
    studentId: "STU005",
    studentName: "Meena Khasi",
    schemeId: "SCH002",
    schemeName: "NOS",
    status: "rejected",
    state: "Meghalaya",
    category: "General ST",
    submittedDate: "2025-12-05",
    lastUpdated: "2026-01-10",
    documents: [
      {
        id: "DOC014",
        name: "ST_Certificate_Meena.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-05",
        aiScore: 95,
      },
      {
        id: "DOC015",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "flagged",
        uploadDate: "2025-12-05",
        aiScore: 38,
        aiFeedback:
          "The income shown on this certificate (₹3.2 lakh) is above the eligibility limit of ₹2.5 lakh.",
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [
      {
        id: "FLG003",
        type: "eligibility_concern",
        message: "Income certificate shows family income above threshold",
        plainLanguageMessage:
          "Your family income certificate shows ₹3.2 lakh per year, but this scholarship is only for families earning less than ₹2.5 lakh per year. Unfortunately, you don't meet this requirement.",
        severity: "high",
        createdAt: "2026-01-05",
      },
    ],
    deficiencyNotices: [
      {
        id: "DEF002",
        documentId: "DOC015",
        message: "Income certificate exceeds eligibility limit",
        plainLanguageMessage:
          "Your income certificate shows your family earns more than what is allowed for this scholarship. This scholarship is for families earning less than ₹2.5 lakh per year.",
        issuedDate: "2026-01-06",
        resolved: false,
      },
    ],
    amount: 1500000,
    plainReason:
      "Your family income (₹3.2 lakh/year) is above the maximum limit (₹2.5 lakh/year) for this scholarship. You may be eligible for other schemes with higher income limits.",
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP006",
    studentId: "STU006",
    studentName: "Arjun Oraon",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    status: "submitted",
    state: "Chhattisgarh",
    category: "General ST",
    submittedDate: "2026-01-20",
    lastUpdated: "2026-01-20",
    documents: [
      {
        id: "DOC016",
        name: "ST_Certificate_Arjun.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-20",
        aiScore: 0,
      },
      {
        id: "DOC017",
        name: "Marksheet_Class8.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-20",
        aiScore: 0,
      },
    ],
    vaultDocumentIds: ["VDOC013"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 7500,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP007",
    studentId: "STU007",
    studentName: "Sunita Naga",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "selected",
    state: "Nagaland",
    category: "General ST",
    submittedDate: "2025-11-12",
    lastUpdated: "2026-01-18",
    documents: [
      {
        id: "DOC018",
        name: "ST_Certificate_Sunita.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-12",
        aiScore: 97,
      },
      {
        id: "DOC019",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-12",
        aiScore: 93,
      },
      {
        id: "DOC020",
        name: "Research_Proposal_AI.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-12",
        aiScore: 94,
      },
    ],
    vaultDocumentIds: ["VDOC014", "VDOC015"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-20",
    attendancePercentage: 90,
    progressReportUploaded: true,
  },
  {
    id: "APP008",
    studentId: "STU008",
    studentName: "Vikram Toda",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    status: "under_scrutiny",
    state: "Uttarakhand",
    category: "General ST",
    submittedDate: "2026-01-10",
    lastUpdated: "2026-01-19",
    documents: [
      {
        id: "DOC021",
        name: "ST_Certificate_Vikram.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2026-01-10",
        aiScore: 96,
      },
      {
        id: "DOC022",
        name: "Marksheet_Class12.pdf",
        type: "application/pdf",
        status: "flagged",
        uploadDate: "2026-01-10",
        aiScore: 52,
        aiFeedback:
          "The marks percentage is unclear in your scan. Some numbers appear to be overwritten. Please upload a clearer copy from the original marksheet.",
        sampleUrl: "/samples/marksheet_sample.jpg",
      },
    ],
    vaultDocumentIds: ["VDOC016", "VDOC017"],
    aiFlags: [
      {
        id: "FLG004",
        type: "ocr_mismatch",
        message: "Marks percentage unclear - possible tampering detected",
        plainLanguageMessage:
          "We could not clearly read the marks on your marksheet. Some numbers look like they might have been changed. Please upload a clear photo of your original marksheet.",
        severity: "medium",
        createdAt: "2026-01-15",
        suggestion:
          "Take a clear photo of your original marksheet in good lighting, or get a fresh photocopy from your school",
      },
    ],
    deficiencyNotices: [
      {
        id: "DEF003",
        documentId: "DOC022",
        message: "Please provide a clearer scanned copy of marksheet",
        plainLanguageMessage:
          "Your marksheet scan is not clear enough for us to verify your marks. Please take a new photo or scan with better quality.",
        issuedDate: "2026-01-16",
        resolved: false,
        reuploadUrl: "/reupload/DOC022",
      },
    ],
    amount: 12000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP009",
    studentId: "STU009",
    studentName: "Anita Bodo",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "waitlisted",
    state: "Assam",
    category: "General ST",
    submittedDate: "2025-11-18",
    lastUpdated: "2026-01-20",
    documents: [
      {
        id: "DOC023",
        name: "ST_Certificate_Anita.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-18",
        aiScore: 95,
      },
      {
        id: "DOC024",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-18",
        aiScore: 91,
      },
      {
        id: "DOC025",
        name: "Research_Proposal.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-18",
        aiScore: 87,
      },
    ],
    vaultDocumentIds: ["VDOC001", "VDOC018"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP010",
    studentId: "STU010",
    studentName: "Rajan Rathwa",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    status: "selected",
    state: "Gujarat",
    category: "General ST",
    submittedDate: "2025-12-15",
    lastUpdated: "2026-01-15",
    documents: [
      {
        id: "DOC026",
        name: "ST_Certificate_Rajan.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-15",
        aiScore: 98,
      },
      {
        id: "DOC027",
        name: "Marksheet.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-15",
        aiScore: 94,
      },
    ],
    vaultDocumentIds: ["VDOC019", "VDOC020"],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 12000,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-17",
    attendancePercentage: 78,
    progressReportUploaded: true,
  },
  {
    id: "APP011",
    studentId: "STU011",
    studentName: "Deepa Kurumba",
    schemeId: "SCH002",
    schemeName: "NOS",
    status: "screening",
    state: "Tamil Nadu",
    category: "General ST",
    submittedDate: "2025-12-10",
    lastUpdated: "2026-01-17",
    documents: [
      {
        id: "DOC028",
        name: "ST_Certificate_Deepa.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-10",
        aiScore: 96,
      },
      {
        id: "DOC029",
        name: "Passport.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-10",
        aiScore: 90,
      },
      {
        id: "DOC030",
        name: "Admission_Oxford.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-10",
        aiScore: 88,
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 1500000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP012",
    studentId: "STU012",
    studentName: "Suresh Savara",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    status: "submitted",
    state: "Andhra Pradesh",
    category: "General ST",
    submittedDate: "2026-01-22",
    lastUpdated: "2026-01-22",
    documents: [
      {
        id: "DOC031",
        name: "ST_Certificate_Suresh.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-22",
        aiScore: 0,
      },
      {
        id: "DOC032",
        name: "Bonafide_Certificate.pdf",
        type: "application/pdf",
        status: "missing",
        uploadDate: "",
        aiScore: 0,
      },
    ],
    vaultDocumentIds: ["VDOC021"],
    aiFlags: [
      {
        id: "FLG005",
        type: "missing_field",
        message: "Bonafide certificate not uploaded",
        plainLanguageMessage:
          "You haven't uploaded your school bonafide certificate yet. This is required to prove you are currently studying.",
        severity: "high",
        createdAt: "2026-01-22",
        suggestion:
          "Get a bonafide certificate from your school principal and upload it",
      },
    ],
    deficiencyNotices: [
      {
        id: "DEF004",
        documentId: "DOC032",
        message:
          "Bonafide certificate is mandatory. Please upload immediately.",
        plainLanguageMessage:
          "Your school bonafide certificate is missing. Without this, we cannot process your application. Please get it from your school and upload it before the deadline.",
        issuedDate: "2026-01-22",
        resolved: false,
      },
    ],
    amount: 7500,
    draftProgress: 75,
    draftLastSaved: "2026-01-22 14:30:00",
    enrolmentConfirmed: false,
  },
  {
    id: "APP013",
    studentId: "STU013",
    studentName: "Kaviti Kondh",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    status: "under_scrutiny",
    state: "Odisha",
    category: "General ST",
    submittedDate: "2026-01-12",
    lastUpdated: "2026-01-20",
    documents: [
      {
        id: "DOC033",
        name: "ST_Certificate_Kaviti.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2026-01-12",
        aiScore: 97,
      },
      {
        id: "DOC034",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2026-01-12",
        aiScore: 93,
      },
      {
        id: "DOC035",
        name: "Marksheet.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-12",
        aiScore: 65,
        aiFeedback: "Image quality is low. Some marks are not clearly visible.",
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [
      {
        id: "FLG006",
        type: "duplicate_detected",
        message: "Similar marksheet pattern detected in another application",
        plainLanguageMessage:
          "Your marksheet looks similar to another student's marksheet in our system. This could be a coincidence, but we need to verify.",
        severity: "low",
        createdAt: "2026-01-18",
        suggestion:
          "If this is your original marksheet, no action needed. We will verify manually.",
      },
    ],
    deficiencyNotices: [],
    amount: 12000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
  {
    id: "APP014",
    studentId: "STU014",
    studentName: "Mohan Garo",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "screening",
    state: "Meghalaya",
    category: "General ST",
    submittedDate: "2025-11-25",
    lastUpdated: "2026-01-16",
    documents: [
      {
        id: "DOC036",
        name: "ST_Certificate_Mohan.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-25",
        aiScore: 96,
      },
      {
        id: "DOC037",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-25",
        aiScore: 92,
      },
      {
        id: "DOC038",
        name: "Research_Proposal_Law.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-25",
        aiScore: 89,
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: false,
    attendancePercentage: 82,
    progressReportUploaded: false,
  },
  {
    id: "APP015",
    studentId: "STU015",
    studentName: "Pallavi Maria",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "selected",
    state: "Jharkhand",
    category: "General ST",
    submittedDate: "2025-11-08",
    lastUpdated: "2026-01-19",
    documents: [
      {
        id: "DOC039",
        name: "ST_Certificate_Pallavi.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-08",
        aiScore: 98,
      },
      {
        id: "DOC040",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-08",
        aiScore: 95,
      },
      {
        id: "DOC041",
        name: "Research_Proposal.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-11-08",
        aiScore: 93,
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-21",
    attendancePercentage: 95,
    progressReportUploaded: true,
  },
  {
    id: "APP016",
    studentId: "STU016",
    studentName: "Tara Irula",
    schemeId: "SCH003",
    schemeName: "NSTPS",
    status: "selected",
    state: "Tamil Nadu",
    category: "General ST",
    submittedDate: "2025-12-20",
    lastUpdated: "2026-01-14",
    documents: [
      {
        id: "DOC042",
        name: "ST_Certificate_Tara.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-20",
        aiScore: 97,
      },
      {
        id: "DOC043",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2025-12-20",
        aiScore: 94,
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 7500,
    draftProgress: 100,
    enrolmentConfirmed: true,
    enrolmentDate: "2026-01-16",
    attendancePercentage: 88,
    progressReportUploaded: true,
  },
  {
    id: "APP017",
    studentId: "STU017",
    studentName: "Bhim Sahariya",
    schemeId: "SCH004",
    schemeName: "NSTMS",
    status: "draft",
    state: "Madhya Pradesh",
    category: "General ST",
    submittedDate: "",
    lastUpdated: "2026-01-25",
    documents: [
      {
        id: "DOC044",
        name: "ST_Certificate_Bhim.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-25",
        aiScore: 0,
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [],
    deficiencyNotices: [],
    amount: 12000,
    draftProgress: 45,
    draftLastSaved: "2026-01-25 10:15:00",
    enrolmentConfirmed: false,
  },
  {
    id: "APP018",
    studentId: "STU018",
    studentName: "Nirmala Chakma",
    schemeId: "SCH001",
    schemeName: "NFST",
    status: "under_scrutiny",
    state: "Tripura",
    category: "General ST",
    submittedDate: "2026-01-05",
    lastUpdated: "2026-01-21",
    documents: [
      {
        id: "DOC045",
        name: "ST_Certificate_Nirmala.pdf",
        type: "application/pdf",
        status: "verified",
        uploadDate: "2026-01-05",
        aiScore: 96,
      },
      {
        id: "DOC046",
        name: "Income_Certificate.pdf",
        type: "application/pdf",
        status: "pending",
        uploadDate: "2026-01-05",
        aiScore: 70,
        aiFeedback:
          "The income amount on this certificate (₹1,95,000) is different from what you declared (₹1,85,000). Please check and correct.",
      },
    ],
    vaultDocumentIds: [],
    aiFlags: [
      {
        id: "FLG007",
        type: "ocr_mismatch",
        message: "Income figure in certificate differs from declared income",
        plainLanguageMessage:
          "Your income certificate shows ₹1,95,000 but you wrote ₹1,85,000 in the form. These numbers should match exactly.",
        severity: "medium",
        createdAt: "2026-01-19",
        suggestion:
          "Check your income certificate and update the form with the exact amount shown, or get a corrected certificate",
      },
    ],
    deficiencyNotices: [
      {
        id: "DEF005",
        documentId: "DOC046",
        message:
          "Income certificate amount does not match declared income. Please clarify.",
        plainLanguageMessage:
          "The amount on your income certificate doesn't match what you told us. Please make them the same.",
        issuedDate: "2026-01-20",
        resolved: false,
      },
    ],
    amount: 31000,
    draftProgress: 100,
    enrolmentConfirmed: false,
  },
];

export const adminUsers: AdminUser[] = [
  {
    id: "ADM001",
    name: "Dr. Rajesh Kumar",
    email: "rajesh.kumar@mota.gov.in",
    role: "super_admin",
    state: "All",
    department: "MoTA Headquarters",
  },
  {
    id: "ADM002",
    name: "Smt. Anita Sharma",
    email: "anita.sharma@mota.gov.in",
    role: "scrutiny_officer",
    state: "Madhya Pradesh",
    department: "State Nodal Office",
  },
  {
    id: "ADM003",
    name: "Shri Vikram Singh",
    email: "vikram.singh@mota.gov.in",
    role: "screening_committee",
    state: "All",
    department: "Screening Committee",
  },
  {
    id: "ADM004",
    name: "Dr. Meena Devi",
    email: "meena.devi@mota.gov.in",
    role: "nodal_officer",
    state: "Odisha",
    department: "State Nodal Office",
  },
  {
    id: "ADM005",
    name: "Shri Prakash Tudu",
    email: "prakash.tudu@mota.gov.in",
    role: "scrutiny_officer",
    state: "Jharkhand",
    department: "State Nodal Office",
  },
  {
    id: "ADM006",
    name: "Smt. Laxmi Bai",
    email: "laxmi.bai@mota.gov.in",
    role: "screening_committee",
    state: "All",
    department: "Screening Committee",
  },
];

export const auditLog: AuditEntry[] = [
  {
    id: "AUD001",
    adminId: "ADM002",
    adminName: "Smt. Anita Sharma",
    action: "Approved",
    applicationId: "APP001",
    studentName: "Priya Gond",
    timestamp: "2026-01-20 10:30:00",
    details: "All documents verified. Eligibility confirmed.",
  },
  {
    id: "AUD002",
    adminId: "ADM003",
    adminName: "Shri Vikram Singh",
    action: "Selected",
    applicationId: "APP001",
    studentName: "Priya Gond",
    timestamp: "2026-01-20 14:15:00",
    details: "Merit-based selection. Score: 92/100",
  },
  {
    id: "AUD003",
    adminId: "ADM002",
    adminName: "Smt. Anita Sharma",
    action: "Requested Resubmission",
    applicationId: "APP002",
    studentName: "Ramesh Bhil",
    timestamp: "2026-01-12 09:45:00",
    details: "Passport copy unclear. Name mismatch detected by AI.",
  },
  {
    id: "AUD004",
    adminId: "ADM005",
    adminName: "Shri Prakash Tudu",
    action: "Verified",
    applicationId: "APP003",
    studentName: "Lakshmi Santhal",
    timestamp: "2026-01-15 11:20:00",
    details: "Documents verified. Forwarded to screening.",
  },
  {
    id: "AUD005",
    adminId: "ADM004",
    adminName: "Dr. Meena Devi",
    action: "Approved",
    applicationId: "APP004",
    studentName: "Dhruv Munda",
    timestamp: "2026-01-22 16:00:00",
    details: "All documents verified. Research proposal strong.",
  },
  {
    id: "AUD006",
    adminId: "ADM003",
    adminName: "Shri Vikram Singh",
    action: "Rejected",
    applicationId: "APP005",
    studentName: "Meena Khasi",
    timestamp: "2026-01-10 13:30:00",
    details: "Income exceeds eligibility threshold.",
  },
  {
    id: "AUD007",
    adminId: "ADM006",
    adminName: "Smt. Laxmi Bai",
    action: "Selected",
    applicationId: "APP007",
    studentName: "Sunita Naga",
    timestamp: "2026-01-18 10:00:00",
    details: "Merit-based selection. Score: 95/100",
  },
  {
    id: "AUD008",
    adminId: "ADM002",
    adminName: "Smt. Anita Sharma",
    action: "Flagged",
    applicationId: "APP008",
    studentName: "Vikram Toda",
    timestamp: "2026-01-19 15:30:00",
    details: "Marksheet quality insufficient. Possible tampering.",
  },
  {
    id: "AUD009",
    adminId: "ADM003",
    adminName: "Shri Vikram Singh",
    action: "Waitlisted",
    applicationId: "APP009",
    studentName: "Anita Bodo",
    timestamp: "2026-01-20 11:45:00",
    details: "Quota full. Placed on waitlist (position 3).",
  },
  {
    id: "AUD010",
    adminId: "ADM006",
    adminName: "Smt. Laxmi Bai",
    action: "Selected",
    applicationId: "APP010",
    studentName: "Rajan Rathwa",
    timestamp: "2026-01-15 09:30:00",
    details: "Merit-based selection. Score: 88/100",
  },
  {
    id: "AUD011",
    adminId: "ADM004",
    adminName: "Dr. Meena Devi",
    action: "Approved",
    applicationId: "APP015",
    studentName: "Pallavi Maria",
    timestamp: "2026-01-19 14:00:00",
    details: "All documents verified. Strong research proposal.",
  },
  {
    id: "AUD012",
    adminId: "ADM003",
    adminName: "Shri Vikram Singh",
    action: "Selected",
    applicationId: "APP015",
    studentName: "Pallavi Maria",
    timestamp: "2026-01-19 16:30:00",
    details: "Merit-based selection. Score: 91/100",
  },
];

export const notifications: Notification[] = [
  {
    id: "NOT001",
    userId: "STU001",
    type: "status_change",
    title: "Application Selected",
    message:
      "Your NFST application has been selected. Check results page for details.",
    read: false,
    createdAt: "2026-01-20 14:30:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT002",
    userId: "STU001",
    type: "disbursal",
    title: "Payment Processed",
    message: "First installment of ₹31,000 has been credited to your account.",
    read: true,
    createdAt: "2026-01-25 10:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT003",
    userId: "STU002",
    type: "deficiency",
    title: "Document Re-upload Required",
    message:
      "Your passport copy has been flagged. Please upload a clearer version.",
    read: false,
    createdAt: "2026-01-12 09:50:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT004",
    userId: "STU003",
    type: "status_change",
    title: "Application Under Screening",
    message: "Your NFST application has moved to the screening stage.",
    read: true,
    createdAt: "2026-01-15 11:30:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT005",
    userId: "STU005",
    type: "status_change",
    title: "Application Rejected",
    message:
      "Your NOS application has been rejected. Reason: Family income exceeds the ₹2.5 lakh limit for this scheme.",
    read: true,
    createdAt: "2026-01-10 13:45:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT006",
    userId: "STU008",
    type: "deficiency",
    title: "Document Quality Issue",
    message:
      "Your marksheet scan is unclear. Please re-upload with better quality.",
    read: false,
    createdAt: "2026-01-16 10:00:00",
    smsSent: true,
    emailSent: false,
  },
  {
    id: "NOT007",
    userId: "STU009",
    type: "status_change",
    title: "Waitlisted",
    message:
      "Your NFST application has been waitlisted (position 3). You will be notified if a spot opens.",
    read: false,
    createdAt: "2026-01-20 12:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT008",
    userId: "STU012",
    type: "deadline",
    title: "Missing Document Alert",
    message:
      "Bonafide certificate is mandatory. Upload before 2026-02-01 to avoid rejection.",
    read: false,
    createdAt: "2026-01-22 10:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT009",
    userId: "STU018",
    type: "deficiency",
    title: "Income Discrepancy",
    message:
      "Income certificate amount (₹1,95,000) does not match declared income (₹1,85,000). Please correct.",
    read: false,
    createdAt: "2026-01-20 10:30:00",
    smsSent: false,
    emailSent: true,
  },
  {
    id: "NOT010",
    userId: "STU004",
    type: "disbursal",
    title: "Payment Processed",
    message: "First installment of ₹31,000 has been credited to your account.",
    read: true,
    createdAt: "2026-01-28 09:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT011",
    userId: "STU001",
    type: "renewal_reminder",
    title: "Renewal Deadline Approaching",
    message:
      "Your NFST scholarship renewal deadline is 2026-06-30. Submit your renewal application with updated progress report before the deadline.",
    read: false,
    createdAt: "2026-01-28 08:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT012",
    userId: "STU004",
    type: "renewal_reminder",
    title: "Renewal Deadline Approaching",
    message:
      "Your NFST scholarship renewal deadline is 2026-06-30. Upload your attendance report and progress document.",
    read: false,
    createdAt: "2026-01-28 08:00:00",
    smsSent: true,
    emailSent: true,
  },
  {
    id: "NOT013",
    userId: "STU010",
    type: "renewal_reminder",
    title: "Renewal Deadline Approaching",
    message:
      "Your NSTMS scholarship renewal deadline is 2026-09-30. Start your renewal early to avoid lapse.",
    read: false,
    createdAt: "2026-01-27 09:00:00",
    smsSent: false,
    emailSent: true,
  },
  {
    id: "NOT014",
    userId: "STU017",
    type: "general",
    title: "Draft Application Saved",
    message:
      "Your NSTMS application draft has been saved. You can continue filling it anytime. Progress: 45% complete.",
    read: true,
    createdAt: "2026-01-25 10:20:00",
    smsSent: false,
    emailSent: false,
  },
];

export const disbursals: Disbursal[] = [
  {
    id: "DIS001",
    applicationId: "APP001",
    studentName: "Priya Gond",
    amount: 31000,
    status: "processed",
    transactionId: "TXN20260125001",
    date: "2026-01-25",
    bankReference: "SBI/NEFT/98765",
  },
  {
    id: "DIS002",
    applicationId: "APP004",
    studentName: "Dhruv Munda",
    amount: 31000,
    status: "processed",
    transactionId: "TXN20260128001",
    date: "2026-01-28",
    bankReference: "INB/NEFT/12345",
  },
  {
    id: "DIS003",
    applicationId: "APP007",
    studentName: "Sunita Naga",
    amount: 31000,
    status: "pending",
    transactionId: "TXN20260201001",
    date: "2026-02-01",
    bankReference: "Processing",
  },
  {
    id: "DIS004",
    applicationId: "APP010",
    studentName: "Rajan Rathwa",
    amount: 12000,
    status: "processed",
    transactionId: "TXN20260120001",
    date: "2026-01-20",
    bankReference: "IOB/RTGS/54321",
  },
  {
    id: "DIS005",
    applicationId: "APP015",
    studentName: "Pallavi Maria",
    amount: 31000,
    status: "failed",
    transactionId: "TXN20260130001",
    date: "2026-01-30",
    bankReference: "Failed - Invalid IFSC",
  },
  {
    id: "DIS006",
    applicationId: "APP016",
    studentName: "Tara Irula",
    amount: 7500,
    status: "processed",
    transactionId: "TXN20260118001",
    date: "2026-01-18",
    bankReference: "KVBL/NEFT/67890",
  },
  {
    id: "DIS007",
    applicationId: "APP001",
    studentName: "Priya Gond",
    amount: 31000,
    status: "pending",
    transactionId: "TXN20260225001",
    date: "2026-02-25",
    bankReference: "Scheduled",
  },
  {
    id: "DIS008",
    applicationId: "APP004",
    studentName: "Dhruv Munda",
    amount: 31000,
    status: "pending",
    transactionId: "TXN20260228001",
    date: "2026-02-28",
    bankReference: "Scheduled",
  },
];

export const grievances: Grievance[] = [
  {
    id: "GRV001",
    studentId: "STU002",
    studentName: "Ramesh Bhil",
    subject: "Passport name mismatch",
    description:
      "My passport has my full name with middle name but application form only has first and last name. Is this acceptable?",
    status: "in_progress",
    priority: "medium",
    createdAt: "2026-01-13 10:00:00",
    lastUpdated: "2026-01-15 14:30:00",
    response:
      "Please upload a self-attested affidavit confirming both names refer to the same person.",
  },
  {
    id: "GRV002",
    studentId: "STU008",
    studentName: "Vikram Toda",
    subject: "Marksheet upload issue",
    description:
      "The scanned marksheet appears blurry. I have re-scanned at higher resolution but the portal shows the old file.",
    status: "open",
    priority: "high",
    createdAt: "2026-01-17 09:00:00",
    lastUpdated: "2026-01-17 09:00:00",
    needsAssistance: true,
    assistanceType: "CSC Center",
  },
  {
    id: "GRV003",
    studentId: "STU009",
    studentName: "Anita Bodo",
    subject: "Waitlist position inquiry",
    description:
      "I was placed on waitlist position 3. When can I expect a final decision?",
    status: "resolved",
    priority: "low",
    createdAt: "2026-01-21 11:00:00",
    lastUpdated: "2026-01-23 16:00:00",
    response:
      "Waitlist decisions will be communicated by February 15, 2026, depending on selected candidates' acceptance.",
  },
  {
    id: "GRV004",
    studentId: "STU012",
    studentName: "Suresh Savara",
    subject: "Bonafide certificate delay",
    description:
      "My college is taking time to issue the bonafide certificate. Can I get an extension?",
    status: "open",
    priority: "medium",
    createdAt: "2026-01-23 14:00:00",
    lastUpdated: "2026-01-23 14:00:00",
    needsAssistance: true,
    assistanceType: "Ashram School Teacher",
  },
  {
    id: "GRV005",
    studentId: "STU018",
    studentName: "Nirmala Chakma",
    subject: "Income certificate discrepancy",
    description:
      "My income certificate is correct as per the revenue department. The AI flag seems to be an error.",
    status: "in_progress",
    priority: "high",
    createdAt: "2026-01-21 08:00:00",
    lastUpdated: "2026-01-22 11:00:00",
    response:
      "Your concern has been forwarded to the scrutiny officer for manual review.",
  },
  {
    id: "GRV006",
    studentId: "STU017",
    studentName: "Bhim Sahariya",
    subject: "Need help filling application",
    description:
      "I am not able to fill the online form. Can someone from CSC help me?",
    status: "open",
    priority: "high",
    createdAt: "2026-01-25 11:00:00",
    lastUpdated: "2026-01-25 11:00:00",
    needsAssistance: true,
    assistanceType: "CSC Center",
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT001",
    applicationId: "APP001",
    studentId: "STU001",
    year: "2025-26",
    percentage: 88,
    uploadedDate: "2026-01-15",
    verified: true,
  },
  {
    id: "ATT002",
    applicationId: "APP004",
    studentId: "STU004",
    year: "2025-26",
    percentage: 85,
    uploadedDate: "2026-01-18",
    verified: true,
  },
  {
    id: "ATT003",
    applicationId: "APP007",
    studentId: "STU007",
    year: "2025-26",
    percentage: 90,
    uploadedDate: "2026-01-16",
    verified: true,
  },
  {
    id: "ATT004",
    applicationId: "APP010",
    studentId: "STU010",
    year: "2025-26",
    percentage: 78,
    uploadedDate: "2026-01-14",
    verified: true,
  },
  {
    id: "ATT005",
    applicationId: "APP015",
    studentId: "STU015",
    year: "2025-26",
    percentage: 95,
    uploadedDate: "2026-01-17",
    verified: true,
  },
  {
    id: "ATT006",
    applicationId: "APP016",
    studentId: "STU016",
    year: "2025-26",
    percentage: 88,
    uploadedDate: "2026-01-13",
    verified: true,
  },
];

export const cscCenters: CSCCenter[] = [
  {
    id: "CSC001",
    name: "CSC Mandla - Tribal Help Center",
    address: "Near Bus Stand, Mandla",
    district: "Mandla",
    state: "Madhya Pradesh",
    phone: "07672-254321",
    available: true,
  },
  {
    id: "CSC002",
    name: "CSC Udaipur - ST Welfare",
    address: "Sector 5, Udaipur",
    district: "Udaipur",
    state: "Rajasthan",
    phone: "0294-2567890",
    available: true,
  },
  {
    id: "CSC003",
    name: "CSC Dumka - Digital Seva",
    address: "Main Road, Dumka",
    district: "Dumka",
    state: "Jharkhand",
    phone: "06432-234567",
    available: true,
  },
  {
    id: "CSC004",
    name: "CSC Sundargarh - E-Mitra",
    address: "College Square, Sundargarh",
    district: "Sundargarh",
    state: "Odisha",
    phone: "0661-2345678",
    available: false,
  },
  {
    id: "CSC005",
    name: "CSC Kokrajhar - Bodo Advisory",
    address: "BTR Main Office, Kokrajhar",
    district: "Kokrajhar",
    state: "Assam",
    phone: "03661-234567",
    available: true,
  },
];

// Analytics data for Government dashboard
export const analyticsData = {
  totalApplications: 5720,
  verified: 4200,
  selected: 2850,
  disbursed: 2100,
  pending: 1520,
  rejected: 350,
  stateWiseData: [
    {
      state: "Madhya Pradesh",
      applications: 890,
      selected: 520,
      disbursed: 410,
    },
    { state: "Rajasthan", applications: 720, selected: 410, disbursed: 320 },
    { state: "Jharkhand", applications: 650, selected: 380, disbursed: 290 },
    { state: "Odisha", applications: 580, selected: 340, disbursed: 260 },
    { state: "Chhattisgarh", applications: 510, selected: 300, disbursed: 230 },
    { state: "Maharashtra", applications: 420, selected: 250, disbursed: 190 },
    { state: "Gujarat", applications: 380, selected: 220, disbursed: 170 },
    { state: "Tamil Nadu", applications: 350, selected: 200, disbursed: 155 },
    { state: "Assam", applications: 320, selected: 180, disbursed: 140 },
    { state: "Others", applications: 900, selected: 50, disbursed: 35 },
  ],
  categoryWiseData: [
    { category: "PVTG", count: 850 },
    { category: "General ST", count: 3200 },
    { category: "ST (Female)", count: 1670 },
  ],
  schemePerformance: [
    { scheme: "NFST", utilization: 68, avgProcessingDays: 45, dropOffRate: 12 },
    { scheme: "NOS", utilization: 78, avgProcessingDays: 60, dropOffRate: 8 },
    {
      scheme: "NSTPS",
      utilization: 64,
      avgProcessingDays: 20,
      dropOffRate: 18,
    },
    {
      scheme: "NSTMS",
      utilization: 70,
      avgProcessingDays: 25,
      dropOffRate: 15,
    },
  ],
  budgetData: [
    {
      scheme: "NFST",
      allocated: 155000000,
      disbursed: 98000000,
      remaining: 57000000,
    },
    {
      scheme: "NOS",
      allocated: 150000000,
      disbursed: 112000000,
      remaining: 38000000,
    },
    {
      scheme: "NSTPS",
      allocated: 37500000,
      disbursed: 21000000,
      remaining: 16500000,
    },
    {
      scheme: "NSTMS",
      allocated: 36000000,
      disbursed: 25200000,
      remaining: 10800000,
    },
  ],
  monthlyTrend: [
    { month: "Aug", applications: 420, processed: 180 },
    { month: "Sep", applications: 680, processed: 320 },
    { month: "Oct", applications: 950, processed: 510 },
    { month: "Nov", applications: 1200, processed: 680 },
    { month: "Dec", applications: 890, processed: 750 },
    { month: "Jan", applications: 650, processed: 580 },
  ],
};
