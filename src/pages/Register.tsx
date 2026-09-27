// Register Page - Student Registration
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, Button, Input } from '../components/ui';
import { useAuthStore } from '../store';
import { User, Mail, Lock, Phone, MapPin, GraduationCap, CreditCard, Users } from 'lucide-react';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    aadharNumber: '',
    
    // ST Certificate
    stCertificateNumber: '',
    tribeName: '',
    state: '',
    district: '',
    
    // Financial
    familyIncome: '',
    
    // Bank Details
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    
    // Academic
    courseName: '',
    courseLevel: '',
    institution: '',
    yearOfStudy: '',
    
    // Guardian
    guardianName: '',
    guardianRelation: '',
    guardianPhone: '',
    guardianEmail: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.aadharNumber) {
      setError('Please fill all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!/^\d{12}$/.test(formData.aadharNumber.replace(/-/g, ''))) {
      setError('Invalid Aadhaar number');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.stCertificateNumber || !formData.tribeName || !formData.state || !formData.district || !formData.familyIncome) {
      setError('Please fill all required fields');
      return false;
    }
    if (parseInt(formData.familyIncome) > 600000) {
      setError('Family income exceeds eligibility limit for most schemes');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.bankAccountNumber || !formData.bankName || !formData.ifscCode) {
      setError('Please fill all bank details');
      return false;
    }
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      setError('Invalid IFSC code');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.courseName || !formData.courseLevel || !formData.institution || !formData.yearOfStudy) {
      setError('Please fill all academic details');
      return false;
    }
    return true;
  };

  const validateStep5 = () => {
    if (!formData.guardianName || !formData.guardianRelation || !formData.guardianPhone) {
      setError('Please fill all guardian details');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step === 4 && !validateStep4()) return;
    if (step === 5 && !validateStep5()) return;
    
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError('');
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        ...formData,
        familyIncome: parseInt(formData.familyIncome),
        yearOfStudy: parseInt(formData.yearOfStudy),
      });
      navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-800 to-blue-600 shadow-lg shadow-blue-500/20 mb-4">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('register.title')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('register.subtitle')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                s <= step ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-400'
              }`}>
                {s}
              </div>
              {s < 5 && <div className={`w-12 h-0.5 ${s < step ? 'bg-blue-800' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={20} /> {t('register.personalDetails', 'Personal Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Full Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <Input
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    required
                  />
                  <Input
                    label="Password *"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                  />
                  <Input
                    label="Confirm Password *"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                  />
                  <Input
                    label="Phone Number *"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                  <Input
                    label="Aadhaar Number *"
                    name="aadharNumber"
                    value={formData.aadharNumber}
                    onChange={handleChange}
                    placeholder="12-digit Aadhaar"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 2: ST Certificate & Financial */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={20} /> {t('register.stDetails', 'ST Certificate & Financial Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ST Certificate Number *"
                    name="stCertificateNumber"
                    value={formData.stCertificateNumber}
                    onChange={handleChange}
                    placeholder="e.g., ST/MP/2023/001"
                    required
                  />
                  <Input
                    label="Tribe Name *"
                    name="tribeName"
                    value={formData.tribeName}
                    onChange={handleChange}
                    placeholder="e.g., Gond, Bhil, Santhal"
                    required
                  />
                  <Input
                    label="State *"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    required
                  />
                  <Input
                    label="District *"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    placeholder="Your district"
                    required
                  />
                  <Input
                    label="Annual Family Income (₹) *"
                    name="familyIncome"
                    type="number"
                    value={formData.familyIncome}
                    onChange={handleChange}
                    placeholder="e.g., 180000"
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Most schemes require family income below ₹2.5 lakh per year. Some merit-based schemes allow up to ₹6 lakh.
                  </p>
                </div>
              </>
            )}

            {/* Step 3: Bank Details */}
            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <CreditCard size={20} /> {t('register.bankDetails', 'Bank Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Bank Account Number *"
                    name="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    placeholder="Your account number"
                    required
                  />
                  <Input
                    label="Bank Name *"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g., State Bank of India"
                    required
                  />
                  <Input
                    label="IFSC Code *"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleChange}
                    placeholder="e.g., SBIN0001234"
                    required
                  />
                </div>
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ Ensure your bank account is linked to your Aadhaar for Direct Benefit Transfer (DBT).
                  </p>
                </div>
              </>
            )}

            {/* Step 4: Academic Details */}
            {step === 4 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap size={20} /> {t('register.academicDetails', 'Academic Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Course Name *"
                    name="courseName"
                    value={formData.courseName}
                    onChange={handleChange}
                    placeholder="e.g., B.Tech Computer Science"
                    required
                  />
                  <select
                    name="courseLevel"
                    value={formData.courseLevel}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Course Level</option>
                    <option value="Pre-Matric">Pre-Matric (Class IX-X)</option>
                    <option value="Post-Matric">Post-Matric (Class XI+)</option>
                    <option value="Graduation">Graduation</option>
                    <option value="Post Graduation">Post Graduation</option>
                    <option value="Doctorate">Doctorate (Ph.D)</option>
                  </select>
                  <Input
                    label="Institution Name *"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Your college/university/school"
                    required
                  />
                  <Input
                    label="Year of Study *"
                    name="yearOfStudy"
                    type="number"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 5: Guardian Details */}
            {step === 5 && (
              <>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users size={20} /> {t('register.guardianDetails', 'Guardian/Parent Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Guardian Name *"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="Parent/guardian name"
                    required
                  />
                  <select
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other</option>
                  </select>
                  <Input
                    label="Guardian Phone *"
                    name="guardianPhone"
                    type="tel"
                    value={formData.guardianPhone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                  <Input
                    label="Guardian Email"
                    name="guardianEmail"
                    type="email"
                    value={formData.guardianEmail}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    ✅ Your guardian will receive SMS/email alerts about your application status and deadlines.
                  </p>
                </div>
              </>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-2 pt-4">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  {tc('actions.back')}
                </Button>
              )}
              {step < 5 ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  {tc('actions.next')}
                </Button>
              ) : (
                <Button type="submit" loading={loading} className="flex-1">
                  {tc('actions.createAccount')}
                </Button>
              )}
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
              {t('register.alreadyHaveAccount')}{' '}
              <button type="button" onClick={() => navigate('/login')} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {t('register.signIn')}
              </button>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Register;
