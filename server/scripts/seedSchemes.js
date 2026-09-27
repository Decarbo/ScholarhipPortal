require('dotenv').config();
const mongoose = require('mongoose');
const Scheme = require('../models/Scheme');

const schemes = [
    {
        _id: 'SCH001',
        name: 'NFST',
        fullName: 'National Fellowship for Scheduled Tribe Students',
        description:
            'A centrally sponsored fellowship providing financial assistance to ST students pursuing higher education (M.Phil and Ph.D.) in recognized Indian universities. Covers tuition fees, maintenance allowance, and contingency grants.',
        eligibility: [
            'Must belong to Scheduled Tribe (ST) category',
            'Family annual income below ₹6,00,000',
            'Enrolled in M.Phil or Ph.D. program',
            'Not receiving any other central government fellowship'
        ],
        eligibilityCheck: [
            { field: 'familyIncome', operator: 'less_than', value: 600000, label: 'Family income below ₹6 lakh' },
            { field: 'courseLevel', operator: 'in', value: ['M.Phil', 'PhD', 'Ph.D'], label: 'Enrolled in M.Phil/PhD' },
            { field: 'tribeName', operator: 'contains', value: '', label: 'ST category verified' }
        ],
        requiredDocuments: [
            'ST Certificate',
            'Income Certificate',
            'Aadhaar Card',
            'Marksheet of last qualifying exam',
            'Bank Passbook',
            'Bonafide Certificate from institution'
        ],
        amount: 360000,
        duration: '2 years',
        deadline: '2026-03-31',
        quota: 500,
        activeApplications: 0,
        sampleDocuments: [
            {
                _id: 'SMP001',
                name: 'ST Certificate Sample',
                type: 'application/pdf',
                description: 'Standard format for Scheduled Tribe certificate issued by Tehsildar',
                tips: [
                    'Ensure certificate is issued within the last 12 months',
                    'Name must exactly match Aadhaar',
                    'Tehsildar signature and stamp must be clearly visible'
                ],
                commonMistakes: [
                    'Blurry photograph of the certificate',
                    'Missing Tehsildar seal',
                    'Expired certificate (older than 1 year)'
                ]
            },
            {
                _id: 'SMP002',
                name: 'Income Certificate Sample',
                type: 'application/pdf',
                description: 'Income certificate issued by Revenue Department',
                tips: [
                    'Must clearly show annual family income',
                    'Issued within last 6 months',
                    'Revenue officer signature required'
                ],
                commonMistakes: [
                    'Income mentioned in words only (needs both words and figures)',
                    'Missing revenue officer designation'
                ]
            }
        ],
        renewable: true,
        renewalDeadline: '2026-06-30'
    },

    {
        _id: 'SCH002',
        name: 'Post-Matric ST Scholarship',
        fullName: 'Post-Matric Scholarship for Scheduled Tribe Students',
        description:
            'Financial assistance for ST students studying at post-matriculation levels (Class 11 onwards) to enable them to complete their education. Covers maintenance allowance, book grant, and tuition fees.',
        eligibility: [
            'Must belong to Scheduled Tribe (ST) category',
            'Family annual income below ₹2,50,000',
            'Passed Class 10 / Matriculation',
            'Enrolled in Class 11, 12, or higher education'
        ],
        eligibilityCheck: [
            { field: 'familyIncome', operator: 'less_than', value: 250000, label: 'Family income below ₹2.5 lakh' },
            { field: 'courseLevel', operator: 'in', value: ['Class 11', 'Class 12', 'UG', 'PG', 'Diploma'], label: 'Post-matric course level' }
        ],
        requiredDocuments: [
            'ST Certificate',
            'Income Certificate',
            'Aadhaar Card',
            'Class 10 Marksheet',
            'Bank Passbook',
            'Bonafide Certificate'
        ],
        amount: 120000,
        duration: '1 year (renewable)',
        deadline: '2026-02-28',
        quota: 2000,
        activeApplications: 0,
        sampleDocuments: [
            {
                _id: 'SMP003',
                name: 'Class 10 Marksheet Sample',
                type: 'application/pdf',
                description: 'Board-issued matriculation marksheet',
                tips: [
                    'Both sides of marksheet if grades on reverse',
                    'Board seal and signature visible'
                ],
                commonMistakes: ['Only front side uploaded', 'Cut corners hiding board seal']
            }
        ],
        renewable: true,
        renewalDeadline: '2026-05-31'
    },

    {
        _id: 'SCH003',
        name: 'Pre-Matric ST Scholarship',
        fullName: 'Pre-Matric Scholarship for Scheduled Tribe Students',
        description:
            'Scholarship for ST students studying in Classes 9 and 10 to reduce dropout rates and encourage continuation of education. Provides monthly maintenance and annual book grant.',
        eligibility: [
            'Must belong to Scheduled Tribe (ST) category',
            'Family annual income below ₹2,00,000',
            'Enrolled in Class 9 or Class 10',
            'Studying in a recognized school'
        ],
        eligibilityCheck: [
            { field: 'familyIncome', operator: 'less_than', value: 200000, label: 'Family income below ₹2 lakh' },
            { field: 'courseLevel', operator: 'in', value: ['Class 9', 'Class 10'], label: 'Enrolled in Class 9 or 10' }
        ],
        requiredDocuments: [
            'ST Certificate',
            'Income Certificate',
            'Aadhaar Card',
            'Previous Year Marksheet',
            'Bank Passbook',
            'School Bonafide Certificate'
        ],
        amount: 40000,
        duration: '1 year (renewable)',
        deadline: '2026-01-31',
        quota: 3000,
        activeApplications: 0,
        sampleDocuments: [],
        renewable: true,
        renewalDeadline: '2026-05-31'
    },

    {
        _id: 'SCH004',
        name: 'Top Class ST Scholarship',
        fullName: 'Top Class Education Scheme for Scheduled Tribe Students',
        description:
            'A fully-funded scholarship for ST students admitted to top-ranked institutions (IITs, IIMs, NITs, AIIMS, NLUs, and other notified premier institutions). Covers full tuition, living expenses, books, and computers.',
        eligibility: [
            'Must belong to Scheduled Tribe (ST) category',
            'Family annual income below ₹6,00,000',
            'Admitted to a notified premier institution',
            'Not receiving any other scholarship for the same course'
        ],
        eligibilityCheck: [
            { field: 'familyIncome', operator: 'less_than', value: 600000, label: 'Family income below ₹6 lakh' },
            { field: 'institution', operator: 'in', value: ['IIT', 'IIM', 'NIT', 'AIIMS', 'NLU'], label: 'Enrolled in premier institution' }
        ],
        requiredDocuments: [
            'ST Certificate',
            'Income Certificate',
            'Aadhaar Card',
            'Class 12 Marksheet',
            'Admission Letter from Institution',
            'Bank Passbook',
            'Fee Receipt'
        ],
        amount: 500000,
        duration: 'Full course duration',
        deadline: '2026-04-30',
        quota: 200,
        activeApplications: 0,
        sampleDocuments: [],
        renewable: false
    },

    {
        _id: 'SCH005',
        name: 'ST Girls Hostel Grant',
        fullName: 'Grant for Construction of Hostels for ST Girls',
        description:
            'One-time grant to ST girl students for hostel accommodation expenses while pursuing higher education away from home. Helps reduce dropout rates among ST girls.',
        eligibility: [
            'Must be a Scheduled Tribe (ST) girl student',
            'Family annual income below ₹2,50,000',
            'Enrolled in a recognized institution',
            'Residing in a hostel away from home'
        ],
        eligibilityCheck: [
            { field: 'familyIncome', operator: 'less_than', value: 250000, label: 'Family income below ₹2.5 lakh' },
            { field: 'courseLevel', operator: 'in', value: ['UG', 'PG', 'Diploma', 'PhD'], label: 'Higher education course' }
        ],
        requiredDocuments: [
            'ST Certificate',
            'Income Certificate',
            'Aadhaar Card',
            'Hostel Allotment Letter',
            'Bonafide Certificate',
            'Bank Passbook'
        ],
        amount: 75000,
        duration: '1 year',
        deadline: '2026-03-15',
        quota: 800,
        activeApplications: 0,
        sampleDocuments: [],
        renewable: true,
        renewalDeadline: '2026-06-30'
    }
];

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        let inserted = 0;
        let skipped = 0;

        for (const scheme of schemes) {
            const exists = await Scheme.findById(scheme._id);
            if (exists) {
                console.log(`⏭️  Skipped (already exists): ${scheme._id} - ${scheme.name}`);
                skipped++;
                continue;
            }
            await Scheme.create(scheme);
            console.log(`✅ Inserted: ${scheme._id} - ${scheme.name}`);
            inserted++;
        }

        console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}`);
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
})();