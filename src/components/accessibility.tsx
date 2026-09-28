// Accessibility Components - Voice Input, Offline Indicator, SMS Status, CSC Finder
import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  WifiOff,
  Wifi,
  MessageSquare,
  MapPin,
  Phone,
  Globe,
  HelpCircle,
} from "lucide-react";
import { Button, Card, Modal, StatusPill } from "./ui";
import { getStatusType, getStatusLabel } from "./ui";
import { cscCenters } from "../mock/data";
import { checkSMSStatus } from "../services/api";
import { useAppStore } from "../store";

// ============ VOICE INPUT BUTTON ============
export const VoiceInput: React.FC<{
  onTranscript: (text: string) => void;
  label?: string;
}> = ({ onTranscript, label }) => {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const lang = (localStorage.getItem('mota_lang') || 'en');

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!supported) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'sat' ? 'sat-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };
    recognition.onerror = () => setListening(false);

    recognition.start();
  };

  if (!supported) return null;

  const btnLabel = label || (lang === 'hi' ? 'आवाज़ इनपुट' : lang === 'sat' ? 'ᱟᱲᱟᱝ ᱤᱱᱯᱩᱴ' : 'Voice input');
  const listeningText = lang === 'hi' ? 'सुन रहे हैं...' : lang === 'sat' ? 'ᱟᱸᱡᱚᱢᱮᱫᱟ...' : 'Listening...';

  return (
    <button
      onClick={startListening}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all border ${
        listening
          ? "border-[#EF4444]/30 bg-[#EF4444]/[0.05] text-[#EF4444] dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 animate-pulse"
          : "border-[#DEE2E6] bg-transparent text-[#1D293D] hover:bg-[#E6F1F5]/40 hover:text-[#0B75A4] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      }`}
      aria-label={btnLabel}
      title={listening ? listeningText : btnLabel}
    >
      {listening ? <MicOff size={14} /> : <Mic size={14} />}
      <span>{listening ? listeningText : btnLabel}</span>
    </button>
  );
};

// ============ OFFLINE INDICATOR ============
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedLocally, setSavedLocally] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setSavedLocally(true);
      // Simulate local save
      setTimeout(() => setSavedLocally(false), 3000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className='fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg shadow-lg animate-slide-in'>
          <WifiOff size={16} className='text-amber-600 dark:text-amber-400' />
          <span className='text-xs font-medium text-amber-800 dark:text-amber-200'>
            Offline mode — Changes saved locally
          </span>
        </div>
      )}
      {savedLocally && (
        <div className='fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 bg-emerald-100 dark:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-lg animate-slide-in'>
          <Wifi size={16} className='text-emerald-600 dark:text-emerald-400' />
          <span className='text-xs font-medium text-emerald-800 dark:text-emerald-200'>
            Back online — Syncing data...
          </span>
        </div>
      )}
    </>
  );
};

// ============ SMS STATUS CHECK ============
export const SMSStatusCheck: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<
    { id: string; status: string; scheme: string }[] | null
  >(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    const data = await checkSMSStatus(phone);
    setResult(data.applications);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#009B68]/10 text-[#009B68] border border-[#009B68]/20 hover:bg-[#009B68]/20 transition-all cursor-pointer'
        aria-label='Check status via SMS'
      >
        <MessageSquare size={14} />
        <span>📱 SMS Status</span>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setResult(null);
        }}
        title='Check Status via SMS/Phone'
        size='sm'
      >
        <div className='space-y-4 font-sans'>
          <p className='text-sm text-[#64748B] dark:text-slate-400'>
            Don't have a smartphone or internet? Enter your registered phone
            number to check application status via SMS.
          </p>
          <div className='p-3 rounded-lg bg-[#E6F1F5] dark:bg-[#0B75A4]/10 border border-[#0B75A4]/20'>
            <p className='text-xs text-[#0B75A4] dark:text-[#1697C5]'>
              💡 You can also send "STATUS" to <strong>56767</strong> from your
              registered mobile number.
            </p>
          </div>
          <div>
            <label className='block text-xs font-semibold text-[#1D293D] dark:text-slate-300 mb-1.5'>
              Registered Phone Number
            </label>
            <input
              type='tel'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder='Enter 10-digit mobile number'
              className='w-full px-3 py-2 rounded-lg border border-[#CBD5E1] dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-[#1D293D] dark:text-white outline-none focus:ring-2 focus:ring-[#0B75A4]/30 focus:border-[#0B75A4] transition-all'
            />
          </div>
          <Button onClick={handleCheck} loading={loading} className='w-full'>
            Check Status
          </Button>

          {result !== null && (
            <div className='space-y-2 mt-4'>
              {result.length === 0 ? (
                <p className='text-sm text-slate-500 text-center py-4'>
                  No applications found for this number.
                </p>
              ) : (
                result.map((app) => (
                  <div
                    key={app.id}
                    className='flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800'
                  >
                    <div>
                      <p className='text-sm font-medium text-slate-900 dark:text-white'>
                        {app.scheme}
                      </p>
                      <p className='text-xs text-slate-500'>{app.id}</p>
                    </div>
                    <StatusPill
                      status={getStatusType(app.status)}
                      label={getStatusLabel(app.status)}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

// ============ CSC CENTER FINDER ============
export const CSCFinder: React.FC<{ studentState?: string }> = ({
  studentState,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [centers, setCenters] = useState(cscCenters);

  const filteredCenters = studentState
    ? centers.filter((c) => c.state === studentState)
    : centers;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0B75A4]/10 text-[#0B75A4] border border-[#0B75A4]/20 hover:bg-[#0B75A4]/20 transition-all cursor-pointer'
        aria-label='Find nearby CSC center'
      >
        <MapPin size={14} />
        <span>🏢 Get Help (CSC)</span>
      </button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title='Find Help Center Near You'
        size='lg'
      >
        <div className='space-y-4 font-sans'>
          <p className='text-sm text-[#64748B] dark:text-slate-400'>
            Can't fill the form online? Visit a Common Service Center (CSC) or
            Ashram School where trained staff can help you.
          </p>
          <div className='p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'>
            <p className='text-xs text-amber-700 dark:text-amber-300'>
              📞 You can also call the helpline: <strong>1800-XXX-XXXX</strong>{" "}
              (Toll-free, 9 AM - 6 PM)
            </p>
          </div>
          <div className='space-y-3'>
            {filteredCenters.map((center) => (
              <div
                key={center.id}
                className={`p-4 rounded-lg border ${center.available ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"}`}
              >
                <div className='flex items-start justify-between'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-medium text-slate-900 dark:text-white'>
                        {center.name}
                      </p>
                      <StatusPill
                        status={center.available ? "verified" : "draft"}
                        label={center.available ? "Open" : "Closed"}
                      />
                    </div>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1'>
                      <MapPin size={12} /> {center.address}, {center.district},{" "}
                      {center.state}
                    </p>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1'>
                      <Phone size={12} /> {center.phone}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </>
  );
};

// ============ LANGUAGE SELECTOR (Extended) ============
export const LanguageSelector: React.FC<{
  value: string;
  onChange: (lang: string) => void;
}> = ({ value, onChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिंदी" },
    { code: "sat", name: "Santhali", native: "ᱥᱟᱱᱛᱟᱞᱤ" },
    { code: "bn", name: "Bengali", native: "বাংলা" },
    { code: "te", name: "Telugu", native: "తెలుగు" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "or", name: "Odia", native: "ଓଡ଼ᱤଆ" },
    { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
    { code: "as", name: "Assamese", native: "অসমীয়া" },
    { code: "mwr", name: "Bhili", native: "भीली" },
    { code: "gon", name: "Gondi", native: "गोंडी" },
  ];

  const current = languages.find((l) => l.code === value) || languages[0];

  return (
    <div className='relative'>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all'
        aria-label='Select language'
      >
        <Globe size={14} />
        <span>{current.native}</span>
      </button>
      {showDropdown && (
        <>
          <div
            className='fixed inset-0 z-40'
            onClick={() => setShowDropdown(false)}
          />
          <div className='absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChange(lang.code);
                  if (lang.code === 'en' || lang.code === 'hi' || lang.code === 'sat') {
                    useAppStore.getState().setLanguage(lang.code as any);
                  }
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${value === lang.code ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}`}
              >
                <span>{lang.native}</span>
                <span className='text-xs text-slate-400 ml-2'>
                  ({lang.name})
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ============ AUTO-SAVE INDICATOR ============
export const AutoSaveIndicator: React.FC<{
  lastSaved?: string;
  saving?: boolean;
}> = ({ lastSaved, saving }) => {
  if (saving) {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400'>
        <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse' />
        Saving...
      </span>
    );
  }
  if (lastSaved) {
    return (
      <span className='inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400'>
        <span className='w-2 h-2 rounded-full bg-emerald-500' />
        Draft saved {lastSaved}
      </span>
    );
  }
  return null;
};

// ============ SAMPLE DOCUMENT VIEWER ============
export const SampleDocumentViewer: React.FC<{
  samples: {
    id: string;
    name: string;
    description: string;
    tips: string[];
    commonMistakes: string[];
  }[];
}> = ({ samples }) => {
  const [selectedSample, setSelectedSample] = useState<
    (typeof samples)[0] | null
  >(null);

  if (samples.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setSelectedSample(samples[0])}
        className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-all'
        aria-label='View sample documents'
      >
        <HelpCircle size={14} />
        <span>📋 View Samples</span>
      </button>

      <Modal
        isOpen={!!selectedSample}
        onClose={() => setSelectedSample(null)}
        title='Sample Documents & Tips'
        size='lg'
      >
        {selectedSample && (
          <div className='space-y-4'>
            {/* Sample selector */}
            {samples.length > 1 && (
              <div className='flex gap-2 flex-wrap'>
                {samples.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSample(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedSample.id === s.id ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            )}

            <div>
              <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>
                {selectedSample.name}
              </h4>
              <p className='text-sm text-slate-600 dark:text-slate-400 mt-1'>
                {selectedSample.description}
              </p>
            </div>

            <div className='p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'>
              <p className='text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2'>
                ✅ Do's (Tips)
              </p>
              <ul className='space-y-1'>
                {selectedSample.tips.map((tip, i) => (
                  <li
                    key={i}
                    className='text-xs text-emerald-800 dark:text-emerald-200 flex items-start gap-2'
                  >
                    <span className='text-emerald-500 mt-0.5'>•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
              <p className='text-xs font-semibold text-red-700 dark:text-red-300 mb-2'>
                ❌ Common Mistakes to Avoid
              </p>
              <ul className='space-y-1'>
                {selectedSample.commonMistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className='text-xs text-red-800 dark:text-red-200 flex items-start gap-2'
                  >
                    <span className='text-red-500 mt-0.5'>•</span> {mistake}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
