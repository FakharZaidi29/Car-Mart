import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import { api } from '../../api';
import {
  MdSupportAgent, MdCheckCircle, MdClose, MdSend,
  MdAccessTime, MdOutlineEmail, MdOutlinePhone,
} from 'react-icons/md';
import {
  FiFileText, FiAlertCircle, FiCheckCircle, FiClock, FiXCircle,
} from 'react-icons/fi';
import { BsWhatsapp } from 'react-icons/bs';

const CATEGORIES = [
  'General Inquiry',
  'Complaint',
  'Fraud Report',
  'Technical Issue',
  'Billing Issue',
  'Other',
];

const STATUS_STYLES = {
  open:         { cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20', Icon: FiClock,       label: 'Open'        },
  'in-progress':{ cls: 'bg-blue-100  text-blue-700  border-blue-200  dark:bg-blue-500/15  dark:text-blue-400  dark:border-blue-500/20',  Icon: FiAlertCircle, label: 'In Progress' },
  resolved:     { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20', Icon: FiCheckCircle, label: 'Resolved' },
  closed:       { cls: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-zinc-700 dark:text-zinc-400 dark:border-zinc-600', Icon: FiXCircle, label: 'Closed' },
};

const EMPTY = { name: '', email: '', category: 'General Inquiry', subject: '', message: '' };

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.open;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.cls}`}>
      <s.Icon className='text-xs' /> {s.label}
    </span>
  );
}

export default function SupportPage() {
  const user = useSelector(selectUser);

  const [form,       setForm]       = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState('');
  const [myReports,  setMyReports]  = useState([]);
  const [loadingRep, setLoadingRep] = useState(false);

  // Auto-fill name & email when user is logged in
  useEffect(() => {
    if (user) {
      setForm(p => ({ ...p, name: p.name || user.name || '', email: p.email || user.email || '' }));
    }
  }, [user]);

  // Fetch user's own reports
  useEffect(() => {
    if (!user) return;
    setLoadingRep(true);
    api.getMyReports()
      .then(d => setMyReports(d.reports || []))
      .catch(() => {})
      .finally(() => setLoadingRep(false));
  }, [user, submitted]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill all required fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createReport(form);
      setSubmitted(true);
      setForm(EMPTY);
      if (user) setForm(p => ({ ...p, name: user.name || '', email: user.email || '' }));
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewReport = () => setSubmitted(false);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-zinc-950'>

      {/* ── Header ── */}
      <div className='bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <div className='w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5'>
            <MdSupportAgent className='text-amber-400 text-4xl' />
          </div>
          <p className='text-amber-400 text-xs font-bold tracking-widest uppercase mb-2'>We Are Here to Help</p>
          <h1 className='text-3xl md:text-4xl font-black mb-3'>Customer Support</h1>
          <p className='text-slate-400 text-sm max-w-lg mx-auto'>
            Whether it's a complaint, fraud report, or general inquiry — our team is ready to help. We respond within 24 hours.
          </p>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-4 py-10 space-y-8'>

        {/* ── Contact Info Cards ── */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {[
            { icon: MdOutlineEmail,  title: 'Email Us',     desc: 'support@carmart.pk',      sub: 'Reply within 24 hours' },
            { icon: MdOutlinePhone,  title: 'Call Us',      desc: '+92 300 1234567',          sub: 'Mon–Sat, 9am–6pm' },
            { icon: BsWhatsapp,      title: 'WhatsApp',     desc: '+92 300 1234567',          sub: 'Quick response' },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <div key={title} className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 p-5 flex items-center gap-4'>
              <div className='w-11 h-11 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0'>
                <Icon className='text-amber-500 text-xl' />
              </div>
              <div>
                <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm'>{title}</p>
                <p className='text-gray-700 dark:text-zinc-300 text-xs font-medium'>{desc}</p>
                <p className='text-gray-400 dark:text-zinc-500 text-xs'>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Form / Success ── */}
        <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden'>
          <div className='px-6 py-5 border-b border-gray-100 dark:border-zinc-800'>
            <h2 className='font-black text-gray-900 dark:text-zinc-100 text-lg flex items-center gap-2'>
              <FiFileText className='text-amber-500' /> Submit a Report
            </h2>
            <p className='text-gray-400 dark:text-zinc-500 text-sm mt-0.5'>
              Describe your issue below and we will get back to you as soon as possible.
            </p>
          </div>

          {submitted ? (
            <div className='flex flex-col items-center py-16 px-6 text-center'>
              <div className='w-20 h-20 bg-emerald-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mb-5'>
                <MdCheckCircle className='text-emerald-500 text-5xl' />
              </div>
              <h3 className='text-xl font-black text-gray-900 dark:text-zinc-100 mb-2'>Report Submitted Successfully!</h3>
              <p className='text-gray-500 dark:text-zinc-400 text-sm max-w-sm mb-6'>
                We have received your report. Our team will respond to your email within 24 hours.
              </p>
              <button
                onClick={handleNewReport}
                className='flex items-center gap-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-zinc-900 font-bold px-6 py-3 rounded-xl hover:bg-amber-500 dark:hover:bg-amber-400 transition-colors'
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              {error && (
                <div className='flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-3 text-sm'>
                  <MdClose className='flex-shrink-0' /> {error}
                </div>
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5'>
                    Full Name <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder='Enter your full name'
                    className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5'>
                    Email Address <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='email'
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    placeholder='your@email.com'
                    className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5'>
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors'
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5'>
                    Subject <span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    value={form.subject}
                    onChange={e => set('subject', e.target.value)}
                    placeholder='Brief summary of your issue'
                    className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1.5'>
                  Message <span className='text-red-500'>*</span>
                </label>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  placeholder='Describe your issue in detail...'
                  className='w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none'
                />
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={submitting}
                  className='flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-7 py-3 rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-60'
                >
                  <MdSend /> {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── My Reports (logged in only) ── */}
        {user && (
          <div className='bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden'>
            <div className='px-6 py-5 border-b border-gray-100 dark:border-zinc-800'>
              <h2 className='font-black text-gray-900 dark:text-zinc-100 text-lg flex items-center gap-2'>
                <MdAccessTime className='text-amber-500' /> My Reports
              </h2>
              <p className='text-gray-400 dark:text-zinc-500 text-sm mt-0.5'>Track the status of reports you have previously submitted</p>
            </div>

            {loadingRep ? (
              <div className='py-10 text-center text-gray-400 dark:text-zinc-500 text-sm'>Loading...</div>
            ) : myReports.length === 0 ? (
              <div className='py-14 text-center'>
                <FiFileText className='text-5xl mx-auto mb-3 text-gray-200 dark:text-zinc-700' />
                <p className='text-gray-500 dark:text-zinc-400 font-medium'>No reports submitted yet</p>
                <p className='text-gray-400 dark:text-zinc-500 text-sm'>Use the form above to submit your first report</p>
              </div>
            ) : (
              <div className='divide-y divide-gray-100 dark:divide-zinc-800'>
                {myReports.map(r => (
                  <div key={r._id} className='px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1 flex-wrap'>
                        <span className='text-xs font-semibold text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md'>
                          {r.category}
                        </span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm truncate'>{r.subject}</p>
                      <p className='text-gray-400 dark:text-zinc-500 text-xs mt-0.5 line-clamp-1'>{r.message}</p>
                    </div>
                    <p className='text-xs text-gray-400 dark:text-zinc-500 whitespace-nowrap flex-shrink-0'>
                      {new Date(r.createdAt).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
