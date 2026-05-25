import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchCars } from '../slices/carsSlice';
import { api } from '../../api';
import {
  MdDirectionsCar, MdLocalGasStation, MdSpeed, MdCheckCircle,
  MdPerson, MdPhone, MdEmail, MdAttachMoney, MdDescription,
  MdArrowForward, MdClose,
} from 'react-icons/md';
import { FiShield, FiTrendingUp, FiDollarSign, FiCheckCircle, FiCamera } from 'react-icons/fi';
import { TbManualGearbox, TbEngine } from 'react-icons/tb';

const MAKES  = ['Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'MG', 'Daihatsu', 'Mitsubishi', 'Nissan', 'Other'];
const YEARS  = Array.from({ length: 15 }, (_, i) => 2024 - i);
const FUELS  = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG'];
const TRANS  = ['Automatic', 'Manual'];
const TYPES  = ['Sedan', 'SUV', 'Hatchback', 'MPV', 'Pickup', 'Van', 'Other'];
const COLORS = ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue', 'Brown', 'Gold', 'Other'];

function SelectField({ label, k, options, icon: Icon, form, errors, set }) {
  return (
    <div>
      <label className='block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5'>
        {label} {errors[k] && <span className='text-red-400 normal-case font-normal'>— {errors[k]}</span>}
      </label>
      <div className='relative'>
        {Icon && <Icon className='absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 text-base pointer-events-none' />}
        <select
          value={form[k]}
          onChange={e => set(k, e.target.value)}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border ${errors[k] ? 'border-red-400' : 'border-gray-200 dark:border-zinc-700'} text-gray-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all`}
        >
          <option value=''>Select {label}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );
}

function InputField({ label, k, placeholder, icon: Icon, type = 'text', prefix, form, errors, set }) {
  return (
    <div>
      <label className='block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5'>
        {label} {errors[k] && <span className='text-red-400 normal-case font-normal'>— {errors[k]}</span>}
      </label>
      <div className='relative'>
        {Icon && <Icon className='absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 text-base pointer-events-none' />}
        {prefix && <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold'>PKR</span>}
        <input
          type={type}
          value={form[k]}
          onChange={e => set(k, e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-10' : prefix ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border ${errors[k] ? 'border-red-400' : 'border-gray-200 dark:border-zinc-700'} text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all`}
        />
      </div>
    </div>
  );
}

const BENEFITS = [
  { icon: FiDollarSign, title: 'Free Listing',      desc: 'List your car for free with no hidden charges or commissions on sale.' },
  { icon: FiTrendingUp, title: 'Massive Reach',     desc: 'Your car gets seen by 50,000+ active buyers every month across Pakistan.' },
  { icon: FiShield,     title: 'Verified Buyers',   desc: 'We verify every buyer before they contact you. No time wasters.' },
  { icon: FiCheckCircle,title: 'Quick Sale',        desc: 'Most cars listed on Car Mart sell within 7–14 days of listing.' },
];

const HOW_STEPS = [
  { step: '01', title: 'Fill the Form',    desc: 'Enter your car details, upload photos, and set your asking price.' },
  { step: '02', title: 'Get Verified',     desc: 'Our team verifies your listing and activates it within 24 hours.' },
  { step: '03', title: 'Receive Offers',   desc: 'Buyers contact you directly. You choose who to deal with.' },
  { step: '04', title: 'Close the Deal',   desc: 'Finalize the deal through our secure escrow payment system.' },
];

export default function SellYourCar() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    make: '', model: '', year: '', price: '', mileage: '',
    fuel: '', transmission: '', type: '', color: '', description: '',
    name: '', phone: '', email: '', city: '',
  });
  const [errors,      setErrors]      = useState({});
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [images,      setImages]      = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const fileRef = useRef();

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > 10) {
      alert('Maximum 10 photos allowed.');
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.uploadImage(fd);
        setImages(p => [...p, `http://localhost:5000${res.url}`]);
      }
    } catch (err) {
      setSubmitError('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => setImages(p => p.filter((_, i) => i !== idx));

  const validate = () => {
    const e = {};
    if (!form.make)         e.make         = 'Required';
    if (!form.model.trim()) e.model        = 'Required';
    if (!form.year)         e.year         = 'Required';
    if (!form.price.trim()) e.price        = 'Required';
    if (!form.fuel)         e.fuel         = 'Required';
    if (!form.transmission) e.transmission = 'Required';
    if (!form.name.trim())  e.name         = 'Required';
    if (!form.phone.trim()) e.phone        = 'Required';
    if (!form.email.trim()) e.email        = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.submitListing({ ...form, image: images[0] || '', images });
      dispatch(fetchCars());
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center px-4'>
      <div className='anim-scale-in text-center max-w-md'>
        <div className='w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30'>
          <MdCheckCircle className='text-5xl text-white' />
        </div>
        <h1 className='text-3xl font-black text-gray-900 dark:text-zinc-100 mb-3'>Listing Submitted!</h1>
        <p className='text-gray-500 dark:text-zinc-400 leading-relaxed mb-8 text-sm'>
          Your car listing for <strong className='text-gray-800 dark:text-zinc-200'>{form.make} {form.model} {form.year}</strong> has been received.
          Our team will verify and activate it within <strong className='text-amber-600'>24 hours</strong>.
        </p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Link to='/' className='bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black px-8 py-3 rounded-xl hover:-translate-y-0.5 transition-all hover:shadow-lg hover:shadow-amber-500/30'>
            Back to Home
          </Link>
          <button onClick={() => { setSubmitted(false); setForm({ make:'',model:'',year:'',price:'',mileage:'',fuel:'',transmission:'',type:'',color:'',description:'',name:'',phone:'',email:'',city:'' }); }}
            className='border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 font-semibold px-8 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'>
            List Another Car
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-zinc-950'>

      {/* Hero */}
      <div className='bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-16 px-4 relative overflow-hidden'>
        <div className='absolute -top-20 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-10 -left-10 w-56 h-56 bg-orange-500/10 rounded-full blur-3xl' />
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <div className='inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-widest'>
            <MdDirectionsCar /> Free Listing — No Commission
          </div>
          <h1 className='text-4xl sm:text-5xl font-black text-white mb-4 leading-tight'>
            Sell Your Car<br />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500'>
              Faster, Smarter
            </span>
          </h1>
          <p className='text-slate-400 text-base max-w-xl mx-auto'>
            List your car for free and reach 50,000+ verified buyers across Pakistan.
            Most cars sell within 7–14 days.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12'>
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className='bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-gray-100 dark:border-zinc-700 text-center'>
              <div className='w-12 h-12 bg-amber-50 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3'>
                <Icon className='text-amber-500 text-xl' />
              </div>
              <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-sm mb-1'>{title}</h3>
              <p className='text-gray-500 dark:text-zinc-400 text-xs leading-relaxed hidden sm:block'>{desc}</p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className='mb-12'>
          <h2 className='text-2xl font-black text-gray-900 dark:text-zinc-100 text-center mb-8'>How It Works</h2>
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-5'>
            {HOW_STEPS.map(({ step, title, desc }) => (
              <div key={step} className='text-center'>
                <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20'>
                  <span className='text-white font-black text-sm'>{step}</span>
                </div>
                <h3 className='font-bold text-gray-900 dark:text-zinc-100 text-sm mb-1'>{title}</h3>
                <p className='text-gray-500 dark:text-zinc-400 text-xs leading-relaxed'>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className='bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-700 p-6 sm:p-8 shadow-sm'>

            {/* Car Details */}
            <h2 className='text-xl font-black text-gray-900 dark:text-zinc-100 mb-5 flex items-center gap-2'>
              <MdDirectionsCar className='text-amber-500' /> Car Details
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
              <SelectField label='Make'         k='make'         options={MAKES}  icon={MdDirectionsCar}   form={form} errors={errors} set={set} />
              <InputField  label='Model'        k='model'        placeholder='e.g. Civic, Sportage'        form={form} errors={errors} set={set} />
              <SelectField label='Year'         k='year'         options={YEARS}  icon={null}              form={form} errors={errors} set={set} />
              <SelectField label='Fuel Type'    k='fuel'         options={FUELS}  icon={MdLocalGasStation} form={form} errors={errors} set={set} />
              <SelectField label='Transmission' k='transmission' options={TRANS}  icon={TbManualGearbox}   form={form} errors={errors} set={set} />
              <SelectField label='Body Type'    k='type'         options={TYPES}  icon={MdDirectionsCar}   form={form} errors={errors} set={set} />
              <SelectField label='Color'        k='color'        options={COLORS} icon={null}              form={form} errors={errors} set={set} />
              <InputField  label='Mileage (km)' k='mileage'      placeholder='e.g. 25000' type='number' icon={MdSpeed} form={form} errors={errors} set={set} />
              <InputField  label='Asking Price' k='price'        placeholder='e.g. 3500000' type='number' prefix      form={form} errors={errors} set={set} />
            </div>

            {/* Description */}
            <div className='mb-8'>
              <label className='block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5'>
                Description (optional)
              </label>
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={3}
                placeholder='Mention condition, service history, accessories, reason for selling…'
                className='w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none'
              />
            </div>

            {/* Photo Upload */}
            <div className='mb-8'>
              <label className='block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5'>
                Photos (optional) <span className='normal-case font-normal text-gray-400'>— {images.length}/10</span>
              </label>

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type='file'
                accept='image/*'
                multiple
                className='hidden'
                onChange={handleImageUpload}
              />

              {/* Upload zone */}
              <div
                onClick={() => !uploading && fileRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                  uploading
                    ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/5 cursor-wait'
                    : 'border-gray-200 dark:border-zinc-700 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/5 cursor-pointer'
                } group`}
              >
                {uploading ? (
                  <>
                    <svg className='animate-spin h-8 w-8 text-amber-500 mx-auto mb-2' viewBox='0 0 24 24' fill='none'>
                      <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/>
                      <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/>
                    </svg>
                    <p className='text-sm text-amber-600 font-semibold'>Uploading...</p>
                  </>
                ) : (
                  <>
                    <FiCamera className='text-3xl text-gray-300 dark:text-zinc-600 group-hover:text-amber-400 transition-colors mx-auto mb-2' />
                    <p className='text-sm text-gray-500 dark:text-zinc-400 font-medium'>Click to upload car photos</p>
                    <p className='text-xs text-gray-300 dark:text-zinc-600 mt-1'>Up to 10 photos · JPG, PNG · Max 5MB each</p>
                  </>
                )}
              </div>

              {/* Image previews */}
              {images.length > 0 && (
                <div className='grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4'>
                  {images.map((url, idx) => (
                    <div key={idx} className='relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700'>
                      <img src={url} alt={`Car ${idx + 1}`} className='w-full h-full object-cover' />
                      {idx === 0 && (
                        <span className='absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md'>
                          MAIN
                        </span>
                      )}
                      <button
                        type='button'
                        onClick={() => removeImage(idx)}
                        className='absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <MdClose className='text-xs' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <h2 className='text-xl font-black text-gray-900 dark:text-zinc-100 mb-5 flex items-center gap-2'>
              <MdPerson className='text-amber-500' /> Your Contact Info
            </h2>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8'>
              <InputField label='Full Name' k='name'  placeholder='Ahmed Raza'      icon={MdPerson}                    form={form} errors={errors} set={set} />
              <InputField label='Phone'    k='phone' placeholder='03xx-xxxxxxx'     icon={MdPhone}  type='tel'         form={form} errors={errors} set={set} />
              <InputField label='Email'    k='email' placeholder='you@email.com'    icon={MdEmail}  type='email'       form={form} errors={errors} set={set} />
              <InputField label='City'     k='city'  placeholder='Lahore, Karachi…'                                   form={form} errors={errors} set={set} />
            </div>

            {submitError && (
              <p className='text-red-400 text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 mb-4'>{submitError}</p>
            )}
            <button
              type='submit'
              disabled={submitting}
              className='w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-amber-500/30 flex items-center justify-center gap-2 text-base'
            >
              {submitting ? 'Submitting…' : <> Submit Listing <MdArrowForward className='text-xl' /></>}
            </button>
            <p className='text-center text-xs text-gray-400 dark:text-zinc-500 mt-3'>
              By submitting, you agree to our <Link to='#' className='text-amber-500 hover:underline'>Terms & Conditions</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
