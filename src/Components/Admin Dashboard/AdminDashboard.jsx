import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '../slices/authSlice';
import { fetchCars } from '../slices/carsSlice';
import { api } from '../../api';
import {
  MdDirectionsCar, MdDashboard, MdShoppingBag, MdPeople,
  MdMenu, MdClose, MdEdit, MdDelete, MdAdd, MdSearch,
  MdTrendingUp, MdAttachMoney, MdLogout, MdUpload, MdCheckCircle, MdCancel,
  MdStar, MdPerson, MdHistory,
} from 'react-icons/md';
import { FiPackage, FiUsers, FiBarChart2, FiChevronLeft, FiFileText, FiAlertCircle, FiCheckCircle, FiClock, FiXCircle, FiInbox } from 'react-icons/fi';
import { BsCarFront } from 'react-icons/bs';

const ORDER_STATUSES = ['pending', 'processing', 'delivered', 'cancelled'];
const AVATAR_COLORS  = [
  'from-blue-500 to-blue-700', 'from-rose-500 to-pink-700',
  'from-emerald-500 to-teal-700', 'from-amber-500 to-orange-600',
  'from-violet-500 to-purple-700', 'from-red-500 to-red-700',
];

const fmt = (n) => 'PKR ' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 });

const BADGE = {
  available:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  sold:       'bg-red-500/15     text-red-400     border-red-500/20',
  delivered:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  processing: 'bg-blue-500/15    text-blue-400    border-blue-500/20',
  pending:    'bg-amber-500/15   text-amber-400   border-amber-500/20',
  rejected:   'bg-red-500/15     text-red-400     border-red-500/20',
  cancelled:  'bg-red-500/15     text-red-400     border-red-500/20',
};
const BADGE_LABEL = { available:'Available', sold:'Sold', delivered:'Delivered', processing:'Processing', pending:'Pending', rejected:'Rejected', cancelled:'Cancelled' };

const Badge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BADGE[status] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
    {BADGE_LABEL[status] ?? status}
  </span>
);

const Avatar = ({ name = '', idx = 0 }) => (
  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
    {name.slice(0, 2).toUpperCase()}
  </div>
);

const StatCard = ({ label, value, sub, icon: Icon, color }) => (
  <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-200'>
    <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
      <Icon className='text-xl text-white' />
    </div>
    <p className='text-zinc-500 text-xs font-medium mb-1'>{label}</p>
    <p className='text-2xl font-black text-zinc-100 mb-1'>{value}</p>
    <p className='text-xs text-emerald-400 flex items-center gap-1'>
      <MdTrendingUp /> {sub}
    </p>
  </div>
);

const Table = ({ headers, children, empty }) => (
  <div className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-zinc-800'>
            {headers.map(h => (
              <th key={h} className='text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap'>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
    {empty && (
      <div className='py-16 text-center text-zinc-600'>
        <MdSearch className='text-4xl mx-auto mb-2 opacity-30' />
        <p>No results found</p>
      </div>
    )}
  </div>
);

const TR = ({ children }) => (
  <tr className='border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors'>{children}</tr>
);
const TD = ({ children, className = '' }) => (
  <td className={`px-4 py-3.5 whitespace-nowrap ${className}`}>{children}</td>
);

const EMPTY_CAR = {
  make: '', model: '', year: new Date().getFullYear(), price: '',
  mileage: '', fuel: 'Petrol', transmission: 'Auto',
  type: 'Sedan', color: '', badge: '', description: '', image: '', status: 'available',
};

function CarModal({ car, onClose, onSaved }) {
  const [form, setForm]       = useState(car ? {
    make: car.make, model: car.model, year: car.year, price: car.price,
    mileage: car.mileage, fuel: car.fuel, transmission: car.transmission,
    type: car.type, color: car.color, badge: car.badge || '',
    description: car.description || '', image: car.image || '', status: car.status,
    featured: car.featured || false,
  } : EMPTY_CAR);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState('');
  const fileRef = useRef();

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.uploadImage(fd);
      set('image', `http://localhost:5000${res.url}`);
    } catch (err) {
      setError('Image upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.make || !form.model || !form.price) {
      setError('Make, Model and Price are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        year: Number(form.year), price: Number(form.price),
        mileage: Number(form.mileage) || 0,
      };
      if (car?._id) {
        await api.updateCar(car._id, body);
      } else {
        await api.createCar(body);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto' onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between mb-5'>
          <h2 className='text-lg font-bold text-zinc-100'>{car ? 'Edit Car' : 'Add New Car'}</h2>
          <button onClick={onClose} className='text-zinc-500 hover:text-white p-1 transition-colors'>
            <MdClose className='text-xl' />
          </button>
        </div>

        {error && <p className='text-red-400 text-xs mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2'>{error}</p>}

        <div className='grid grid-cols-2 gap-4'>
          {[
            { label: 'Make',        key: 'make',        placeholder: 'Toyota' },
            { label: 'Model',       key: 'model',       placeholder: 'Corolla' },
            { label: 'Year',        key: 'year',        placeholder: '2024', type: 'number' },
            { label: 'Price (PKR)', key: 'price',       placeholder: '3200000', type: 'number' },
            { label: 'Mileage (km)',key: 'mileage',     placeholder: '15000', type: 'number' },
            { label: 'Color',       key: 'color',       placeholder: 'Pearl White' },
          ].map(f => (
            <div key={f.key}>
              <label className='block text-xs font-medium text-zinc-500 mb-1.5'>{f.label}</label>
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors'
              />
            </div>
          ))}

          {[
            { label: 'Fuel',         key: 'fuel',         opts: ['Petrol','Diesel','Hybrid'] },
            { label: 'Transmission', key: 'transmission', opts: ['Auto','Manual'] },
            { label: 'Body Type',    key: 'type',         opts: ['Sedan','SUV','Hatchback','MPV','Pickup','Van','Sports','Other'] },
            { label: 'Badge',        key: 'badge',        opts: ['','Popular','New Arrival','Featured','Best Value','Hybrid','Budget Pick','Premium'] },
            { label: 'Status',       key: 'status',       opts: ['available','sold'] },
          ].map(f => (
            <div key={f.key}>
              <label className='block text-xs font-medium text-zinc-500 mb-1.5'>{f.label}</label>
              <select
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 transition-colors'
              >
                {f.opts.map(o => <option key={o} value={o}>{o || '— None —'}</option>)}
              </select>
            </div>
          ))}

          <div className='col-span-2'>
            <label className='flex items-center gap-3 cursor-pointer'>
              <div
                onClick={() => set('featured', !form.featured)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${form.featured ? 'bg-amber-500' : 'bg-zinc-700'}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.featured ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <span className='text-sm font-semibold text-zinc-200'>Featured Listing</span>
                <p className='text-xs text-zinc-500'>Show in featured section on homepage</p>
              </div>
            </label>
          </div>

          <div className='col-span-2'>
            <label className='block text-xs font-medium text-zinc-500 mb-1.5'>Description</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder='Short description…'
              className='w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors resize-none'
            />
          </div>

          <div className='col-span-2'>
            <label className='block text-xs font-medium text-zinc-500 mb-1.5'>Car Image</label>
            <div className='flex gap-3 items-center'>
              <input
                value={form.image}
                onChange={e => set('image', e.target.value)}
                placeholder='Image URL (or upload below)'
                className='flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors'
              />
              <input ref={fileRef} type='file' accept='image/*' onChange={handleUpload} className='hidden' />
              <button
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                className='flex items-center gap-2 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-zinc-300 hover:border-amber-500 hover:text-amber-400 transition-colors whitespace-nowrap'
              >
                <MdUpload /> {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
            {form.image && (
              <img src={form.image} alt='' className='mt-2 h-20 rounded-xl object-cover' onError={e => { e.currentTarget.style.display='none'; }} />
            )}
          </div>
        </div>

        <div className='flex gap-3 mt-6 justify-end'>
          <button onClick={onClose} className='px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors'>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-bold text-sm hover:from-amber-400 hover:to-orange-400 transition-all disabled:opacity-60'
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

const DeleteConfirm = ({ onConfirm, onCancel, loading }) => (
  <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
    <div className='bg-zinc-900 border border-zinc-700 rounded-2xl p-7 w-full max-w-sm shadow-2xl text-center'>
      <div className='w-14 h-14 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center mx-auto mb-4'>
        <MdDelete className='text-red-400 text-2xl' />
      </div>
      <h3 className='text-lg font-bold text-zinc-100 mb-2'>Delete listing?</h3>
      <p className='text-zinc-500 text-sm mb-6'>This action cannot be undone.</p>
      <div className='flex gap-3'>
        <button onClick={onCancel} className='flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 hover:text-white text-sm transition-colors'>Cancel</button>
        <button onClick={onConfirm} disabled={loading} className='flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-sm transition-colors disabled:opacity-60'>
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

function Overview({ cars, orders, openReports, pendingListings }) {
  const revenue = orders.filter(o => o.status === 'delivered').reduce((a, o) => a + (o.totalAmount || 0), 0);
  const pending  = orders.filter(o => o.status === 'pending').length;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
        <StatCard label='Total Cars'       value={cars.filter(c=>c.status==='available').length} sub='Available'              icon={BsCarFront}    color='bg-blue-600'   />
        <StatCard label='Pending Review'   value={pendingListings}  sub='Awaiting approval'                                   icon={FiInbox}       color='bg-amber-600'  />
        <StatCard label='Total Orders'     value={orders.length}    sub={`${pending} pending`}                                icon={FiPackage}     color='bg-violet-600' />
        <StatCard label='Sold Cars'        value={cars.filter(c=>c.status==='sold').length} sub='Total sold'                  icon={MdShoppingBag} color='bg-emerald-600'/>
        <StatCard label='Revenue'          value={revenue ? `PKR ${(revenue/1000000).toFixed(1)}M` : '—'} sub='From orders'  icon={MdAttachMoney} color='bg-teal-600'   />
        <StatCard label='Open Reports'     value={openReports}      sub='Awaiting response'                                   icon={FiFileText}    color='bg-rose-600'   />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-sm font-bold text-zinc-100 mb-4'>Recent Orders</p>
          {orders.length === 0 ? (
            <p className='text-zinc-600 text-sm text-center py-6'>No orders yet</p>
          ) : (
            <div className='space-y-3'>
              {orders.slice(0, 5).map((o, i) => (
                <div key={o._id} className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Avatar name={o.customer?.name || '?'} idx={i} />
                    <div>
                      <p className='text-sm text-zinc-100 font-medium'>{o.customer?.name}</p>
                      <p className='text-xs text-zinc-500'>{o.orderId}</p>
                    </div>
                  </div>
                  <div className='text-right'>
                    <p className='text-sm text-zinc-100 font-semibold'>{fmt(o.totalAmount)}</p>
                    <Badge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-sm font-bold text-zinc-100 mb-4'>Inventory Snapshot</p>
          <div className='space-y-3'>
            {cars.slice(0, 5).map(car => (
              <div key={car._id} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-9 h-9 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden'>
                    {car.image
                      ? <img src={car.image} alt='' className='w-full h-full object-cover' onError={e=>{e.currentTarget.style.display='none';}} />
                      : <BsCarFront className='text-amber-400 text-lg m-auto' />
                    }
                  </div>
                  <div>
                    <p className='text-sm text-zinc-100 font-medium'>{car.make} {car.model}</p>
                    <p className='text-xs text-zinc-500'>{car.type} · {car.year}</p>
                  </div>
                </div>
                <Badge status={car.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CarListings({ cars, setCars }) {
  const dispatch = useDispatch();
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editCar,   setEditCar]   = useState(null);
  const [deleteId,  setDeleteId]  = useState(null);
  const [deleting,  setDeleting]  = useState(false);

  const inventory = cars.filter(c => c.status !== 'pending' && c.status !== 'rejected');
  const filtered = inventory.filter(c =>
    (filter === 'all' || c.status === filter) &&
    (`${c.make} ${c.model}`.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSaved = async () => {
    setShowModal(false); setEditCar(null);
    const data = await api.getAdminCars();
    setCars(data.cars || []);
    dispatch(fetchCars());
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteCar(deleteId);
      setCars(p => p.filter(c => c._id !== deleteId));
      dispatch(fetchCars());
    } catch {}
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div>
      {(showModal || editCar) && (
        <CarModal car={editCar} onClose={() => { setShowModal(false); setEditCar(null); }} onSaved={handleSaved} />
      )}
      {deleteId && (
        <DeleteConfirm loading={deleting} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}

      <div className='flex items-center justify-between mb-5 flex-wrap gap-3'>
        <div className='flex items-center gap-3 flex-wrap'>
          <div className='relative'>
            <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder='Search cars…'
              className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-48'
            />
          </div>
          <div className='flex gap-2'>
            {[{v:'all',l:'All'},{v:'available',l:'Available'},{v:'sold',l:'Sold'}].map(f => (
              <button key={f.v} onClick={() => setFilter(f.v)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  filter === f.v ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
                }`}
              >{f.l}</button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className='flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-900 font-bold px-4 py-2.5 rounded-xl text-sm hover:from-amber-400 hover:to-orange-400 transition-all'
        >
          <MdAdd className='text-lg' /> Add Car
        </button>
      </div>

      <Table headers={['Car','Make','Year','Type','Price','Status','Actions']} empty={filtered.length === 0}>
        {filtered.map(car => (
          <TR key={car._id}>
            <TD>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-8 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0'>
                  {car.image
                    ? <img src={car.image} alt='' className='w-full h-full object-cover' onError={e=>{e.currentTarget.style.display='none';}} />
                    : <BsCarFront className='text-amber-400 text-sm m-auto' />
                  }
                </div>
                <span className='text-zinc-100 font-medium'>{car.make} {car.model}</span>
              </div>
            </TD>
            <TD className='text-zinc-400'>{car.make}</TD>
            <TD className='text-zinc-400'>{car.year}</TD>
            <TD className='text-zinc-400'>{car.type}</TD>
            <TD className='text-zinc-100 font-semibold'>{fmt(car.price)}</TD>
            <TD><Badge status={car.status} /></TD>
            <TD>
              <div className='flex items-center gap-1'>
                <button onClick={() => setEditCar(car)} className='p-1.5 text-zinc-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all'>
                  <MdEdit className='text-base' />
                </button>
                <button onClick={() => setDeleteId(car._id)} className='p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all'>
                  <MdDelete className='text-base' />
                </button>
              </div>
            </TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}

function Orders({ orders, setOrders }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    ((o.customer?.name || '').toLowerCase().includes(search.toLowerCase()) || (o.orderId || '').toLowerCase().includes(search.toLowerCase()))
  );

  const handleStatusChange = async (orderId, status) => {
    try {
      await api.updateOrderStatus(orderId, status);
      setOrders(p => p.map(o => o._id === orderId ? { ...o, status } : o));
    } catch {}
  };

  return (
    <div>
      <div className='flex items-center gap-3 flex-wrap mb-5'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder='Search orders…'
            className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-48'
          />
        </div>
        <div className='flex gap-2 flex-wrap'>
          {[{v:'all',l:'All'}, ...ORDER_STATUSES.map(s => ({v:s,l:s.charAt(0).toUpperCase()+s.slice(1)}))].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === f.v ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >{f.l}</button>
          ))}
        </div>
      </div>

      <Table headers={['Order ID','Customer','Car','Amount','Date','Status','Update']} empty={filtered.length === 0}>
        {filtered.map((o, i) => (
          <TR key={o._id}>
            <TD><span className='text-zinc-500 font-mono text-xs'>{o.orderId}</span></TD>
            <TD>
              <div className='flex items-center gap-2.5'>
                <Avatar name={o.customer?.name || '?'} idx={i} />
                <div>
                  <p className='text-zinc-100 font-medium'>{o.customer?.name}</p>
                  <p className='text-zinc-500 text-xs'>{o.customer?.email}</p>
                </div>
              </div>
            </TD>
            <TD className='text-zinc-400 max-w-[140px] truncate'>
              {o.carSnapshot ? `${o.carSnapshot.make} ${o.carSnapshot.model} ${o.carSnapshot.year}` : '—'}
            </TD>
            <TD className='text-zinc-100 font-semibold'>{fmt(o.totalAmount)}</TD>
            <TD className='text-zinc-500 text-xs'>{new Date(o.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</TD>
            <TD><Badge status={o.status} /></TD>
            <TD>
              <select
                value={o.status}
                onChange={e => handleStatusChange(o._id, e.target.value)}
                className='bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer'
              >
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </TD>
          </TR>
        ))}
      </Table>
    </div>
  );
}

const REPORT_STATUS_OPTS = ['open', 'in-progress', 'resolved', 'closed'];
const REPORT_STATUS_STYLES = {
  open:         'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'in-progress':'bg-blue-500/15  text-blue-400  border-blue-500/20',
  resolved:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  closed:       'bg-zinc-700 text-zinc-400 border-zinc-600',
};
const REPORT_STATUS_LABELS = { open:'Open', 'in-progress':'In Progress', resolved:'Resolved', closed:'Closed' };

function ReportStatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${REPORT_STATUS_STYLES[status] ?? 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>
      {REPORT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function Reports({ reports, setReports }) {
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all');
  const [expanded,  setExpanded]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);

  const handleStatus = async (id, status) => {
    try {
      await api.updateReportStatus(id, status);
      setReports(p => p.map(r => r._id === id ? { ...r, status } : r));
    } catch {}
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.deleteReport(id);
      setReports(p => p.filter(r => r._id !== id));
    } catch {}
    setDeleting(null);
  };

  const filtered = reports.filter(r =>
    (filter === 'all' || r.status === filter) &&
    (`${r.subject} ${r.name} ${r.email} ${r.category}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Toolbar */}
      <div className='flex items-center gap-3 flex-wrap mb-5'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder='Search reports…'
            className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-52'
          />
        </div>
        <div className='flex gap-2 flex-wrap'>
          {[{ v: 'all', l: 'All' }, ...REPORT_STATUS_OPTS.map(s => ({ v: s, l: REPORT_STATUS_LABELS[s] }))].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === f.v ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >{f.l}</button>
          ))}
        </div>
        <span className='text-zinc-500 text-xs ml-auto'>{filtered.length} reports</span>
      </div>

      {/* Reports List */}
      {filtered.length === 0 ? (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center text-zinc-600'>
          <FiFileText className='text-4xl mx-auto mb-2 opacity-30' />
          <p>No reports found</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map(r => (
            <div key={r._id} className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
              {/* Row */}
              <div
                className='flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 cursor-pointer hover:bg-zinc-800/50 transition-colors'
                onClick={() => setExpanded(p => p === r._id ? null : r._id)}
              >
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1 flex-wrap'>
                    <span className='text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-md'>{r.category}</span>
                    <ReportStatusBadge status={r.status} />
                  </div>
                  <p className='font-bold text-zinc-100 text-sm truncate'>{r.subject}</p>
                  <p className='text-zinc-500 text-xs mt-0.5'>{r.name} · {r.email}</p>
                </div>
                <div className='flex items-center gap-3 flex-shrink-0'>
                  <p className='text-zinc-600 text-xs'>
                    {new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  <select
                    value={r.status}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleStatus(r._id, e.target.value)}
                    className='bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer'
                  >
                    {REPORT_STATUS_OPTS.map(s => <option key={s} value={s}>{REPORT_STATUS_LABELS[s]}</option>)}
                  </select>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(r._id); }}
                    disabled={deleting === r._id}
                    className='p-1.5 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 disabled:opacity-40'
                    title='Delete'
                  >
                    <MdDelete className='text-base' />
                  </button>
                </div>
              </div>
              {/* Expanded message */}
              {expanded === r._id && (
                <div className='px-5 pb-5 border-t border-zinc-800 pt-4'>
                  <p className='text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2'>Message</p>
                  <p className='text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap'>{r.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const CHART_COLORS = ['#f59e0b','#3b82f6','#10b981','#f43f5e','#8b5cf6','#06b6d4','#ec4899'];

function Analytics({ cars, orders }) {
  const revenueData = (() => {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months[key] = 0;
    }
    orders.filter(o => o.status === 'delivered').forEach(o => {
      const d = new Date(o.createdAt);
      const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      if (key in months) months[key] += o.totalAmount || 0;
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue: Math.round(revenue / 1000) }));
  })();

  const orderStatusData = (() => {
    const counts = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));
  })();

  const makeData = (() => {
    const counts = {};
    cars.filter(c => c.status === 'available').forEach(c => { counts[c.make] = (counts[c.make] || 0) + 1; });
    return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([make, count]) => ({ make, count }));
  })();

  const typeData = (() => {
    const counts = {};
    cars.filter(c => c.status === 'available').forEach(c => { counts[c.type] = (counts[c.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const tooltipStyle = { backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: 8, color: '#e4e4e7', fontSize: 12 };

  return (
    <div className='space-y-6'>
      {/* Revenue Chart */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
        <p className='text-sm font-bold text-zinc-100 mb-4'>Revenue (PKR thousands) — Last 6 Months</p>
        <ResponsiveContainer width='100%' height={220}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id='revGrad' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%'  stopColor='#f59e0b' stopOpacity={0.3} />
                <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#27272a' />
            <XAxis dataKey='month' tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [`PKR ${v}K`, 'Revenue']} />
            <Area type='monotone' dataKey='revenue' stroke='#f59e0b' strokeWidth={2} fill='url(#revGrad)' />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Cars by Make */}
        <div className='lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-sm font-bold text-zinc-100 mb-4'>Inventory by Make</p>
          <ResponsiveContainer width='100%' height={200}>
            <BarChart data={makeData} barSize={32}>
              <CartesianGrid strokeDasharray='3 3' stroke='#27272a' vertical={false} />
              <XAxis dataKey='make' tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Cars']} />
              <Bar dataKey='count' radius={[6,6,0,0]}>
                {makeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Status */}
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
          <p className='text-sm font-bold text-zinc-100 mb-4'>Orders by Status</p>
          {orderStatusData.length === 0 ? (
            <p className='text-zinc-600 text-sm text-center pt-10'>No orders yet</p>
          ) : (
            <ResponsiveContainer width='100%' height={200}>
              <PieChart>
                <Pie data={orderStatusData} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={70} paddingAngle={3}>
                  {orderStatusData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, color: '#71717a' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cars by Body Type */}
      <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5'>
        <p className='text-sm font-bold text-zinc-100 mb-4'>Inventory by Body Type</p>
        <ResponsiveContainer width='100%' height={180}>
          <BarChart data={typeData} barSize={28} layout='vertical'>
            <CartesianGrid strokeDasharray='3 3' stroke='#27272a' horizontal={false} />
            <XAxis type='number' tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis type='category' dataKey='name' tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={tooltipStyle} formatter={v => [v, 'Cars']} />
            <Bar dataKey='value' radius={[0,6,6,0]}>
              {typeData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const ROLES = ['customer', 'seller', 'admin'];
const ROLE_COLORS = {
  admin:    'bg-red-500/15 text-red-400 border-red-500/20',
  seller:   'bg-blue-500/15 text-blue-400 border-blue-500/20',
  customer: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
};

function Users() {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [acting,   setActing]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data.users || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRoleChange = async (id, role) => {
    setActing(id);
    try {
      const data = await api.updateUserRole(id, role);
      setUsers(p => p.map(u => u._id === id ? data.user : u));
    } catch {}
    setActing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setActing(id + '_del');
    try {
      await api.deleteUser(id);
      setUsers(p => p.filter(u => u._id !== id));
    } catch {}
    setActing(null);
  };

  const filtered = users.filter(u =>
    (filter === 'all' || u.role === filter) &&
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className='flex items-center gap-3 flex-wrap mb-5'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search users…'
            className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-52'
          />
        </div>
        <div className='flex gap-2 flex-wrap'>
          {[{v:'all',l:'All'},{v:'customer',l:'Customers'},{v:'seller',l:'Sellers'},{v:'admin',l:'Admins'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === f.v ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >{f.l}</button>
          ))}
        </div>
        <span className='text-zinc-500 text-xs ml-auto'>{filtered.length} users</span>
      </div>

      {loading ? (
        <div className='space-y-3'>
          {[1,2,3,4].map(i => (
            <div key={i} className='bg-zinc-900 border border-zinc-800 rounded-2xl h-16 animate-pulse' />
          ))}
        </div>
      ) : (
        <Table headers={['User', 'Email', 'Phone', 'Role', 'Joined', 'Actions']} empty={filtered.length === 0}>
          {filtered.map((u, i) => (
            <TR key={u._id}>
              <TD>
                <div className='flex items-center gap-3'>
                  <Avatar name={u.name} idx={i} />
                  <span className='text-zinc-100 font-medium'>{u.name}</span>
                </div>
              </TD>
              <TD className='text-zinc-400 text-xs'>{u.email}</TD>
              <TD className='text-zinc-400 text-xs'>{u.phone || '—'}</TD>
              <TD>
                <select
                  value={u.role}
                  disabled={acting === u._id}
                  onChange={e => handleRoleChange(u._id, e.target.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer focus:outline-none ${ROLE_COLORS[u.role]}`}
                >
                  {ROLES.map(r => <option key={r} value={r} className='bg-zinc-900 text-zinc-100'>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </TD>
              <TD className='text-zinc-500 text-xs'>{new Date(u.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</TD>
              <TD>
                <button
                  onClick={() => handleDelete(u._id)}
                  disabled={!!acting}
                  className='p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-40'
                >
                  <MdDelete className='text-base' />
                </button>
              </TD>
            </TR>
          ))}
        </Table>
      )}
    </div>
  );
}

function AllReviews() {
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.getAllReviews()
      .then(d => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await api.deleteReview(id);
      setReviews(p => p.filter(r => r._id !== id));
    } catch {}
    setDeleting(null);
  };

  const filtered = reviews.filter(r =>
    `${r.userName} ${r.comment} ${r.car?.make || ''} ${r.car?.model || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className='flex items-center gap-3 mb-5'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search reviews…'
            className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-52'
          />
        </div>
        <span className='text-zinc-500 text-xs ml-auto'>{filtered.length} reviews</span>
      </div>

      {loading ? (
        <div className='space-y-3'>{[1,2,3].map(i => <div key={i} className='bg-zinc-900 border border-zinc-800 rounded-2xl h-20 animate-pulse' />)}</div>
      ) : filtered.length === 0 ? (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center text-zinc-600'>
          <MdStar className='text-4xl mx-auto mb-2 opacity-30' />
          <p>No reviews found</p>
        </div>
      ) : (
        <div className='space-y-3'>
          {filtered.map((r, i) => (
            <div key={r._id} className='bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 flex items-start gap-4'>
              <Avatar name={r.userName || '?'} idx={i} />
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2 flex-wrap mb-1'>
                  <span className='text-zinc-100 font-semibold text-sm'>{r.userName}</span>
                  <span className='text-zinc-500 text-xs'>on</span>
                  <span className='text-amber-400 text-xs font-semibold'>{r.car ? `${r.car.make} ${r.car.model} ${r.car.year}` : 'Unknown Car'}</span>
                  <div className='flex'>
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={`text-xs ${n <= r.rating ? 'text-amber-400' : 'text-zinc-700'}`}>★</span>
                    ))}
                  </div>
                  <span className='text-zinc-600 text-xs ml-auto'>{new Date(r.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                </div>
                <p className='text-zinc-400 text-sm leading-relaxed line-clamp-2'>{r.comment}</p>
              </div>
              <button
                onClick={() => handleDelete(r._id)}
                disabled={deleting === r._id}
                className='p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0 disabled:opacity-40'
              >
                <MdDelete className='text-base' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ACTION_ICONS = {
  approve_listing: { icon: MdCheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  reject_listing:  { icon: MdCancel,      color: 'text-red-400',     bg: 'bg-red-500/10'     },
  update_order:    { icon: FiPackage,     color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
  update_report:   { icon: FiFileText,    color: 'text-amber-400',   bg: 'bg-amber-500/10'   },
  update_role:     { icon: MdPerson,      color: 'text-violet-400',  bg: 'bg-violet-500/10'  },
  delete_user:     { icon: MdDelete,      color: 'text-red-400',     bg: 'bg-red-500/10'     },
};

function ActivityLogTab() {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getActivity()
      .then(d => setLogs(d.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (date) => {
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60)   return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400)return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-5'>
        <p className='text-zinc-400 text-xs'>Last 100 admin actions</p>
        <button onClick={() => { setLoading(true); api.getActivity().then(d => setLogs(d.logs||[])).catch(()=>{}).finally(()=>setLoading(false)); }}
          className='text-xs text-amber-400 hover:text-amber-300 transition-colors'>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className='space-y-3'>{[1,2,3,4,5].map(i => <div key={i} className='bg-zinc-900 border border-zinc-800 rounded-2xl h-14 animate-pulse' />)}</div>
      ) : logs.length === 0 ? (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center text-zinc-600'>
          <MdHistory className='text-4xl mx-auto mb-2 opacity-30' />
          <p>No activity yet — actions will appear here</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {logs.map(l => {
            const meta = ACTION_ICONS[l.action] || { icon: MdHistory, color: 'text-zinc-400', bg: 'bg-zinc-800' };
            const Icon = meta.icon;
            return (
              <div key={l._id} className='bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-4'>
                <div className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`text-base ${meta.color}`} />
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-zinc-200 text-sm leading-snug'>{l.description}</p>
                  <p className='text-zinc-600 text-xs mt-0.5'>by {l.adminName}</p>
                </div>
                <span className='text-zinc-600 text-xs flex-shrink-0'>{timeAgo(l.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Submissions({ cars, setCars }) {
  const dispatch  = useDispatch();
  const [search,  setSearch]  = useState('');
  const [filter,  setFilter]  = useState('pending');
  const [acting,  setActing]  = useState(null);

  const submissions = cars.filter(c => c.status === 'pending' || c.status === 'rejected');
  const filtered = submissions.filter(c =>
    (filter === 'all' || c.status === filter) &&
    `${c.make} ${c.model} ${c.seller?.name || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleApprove = async (id) => {
    setActing(id + '_approve');
    try {
      await api.approveListing(id);
      setCars(p => p.map(c => c._id === id ? { ...c, status: 'available' } : c));
      dispatch(fetchCars());
    } catch {}
    setActing(null);
  };

  const handleReject = async (id) => {
    setActing(id + '_reject');
    try {
      await api.rejectListing(id);
      setCars(p => p.map(c => c._id === id ? { ...c, status: 'rejected' } : c));
    } catch {}
    setActing(null);
  };

  const handleDelete = async (id) => {
    setActing(id + '_delete');
    try {
      await api.deleteCar(id);
      setCars(p => p.filter(c => c._id !== id));
    } catch {}
    setActing(null);
  };

  return (
    <div>
      <div className='flex items-center gap-3 flex-wrap mb-5'>
        <div className='relative'>
          <MdSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500' />
          <input
            value={search} onChange={e => setSearch(e.target.value)} placeholder='Search submissions…'
            className='bg-zinc-800 border border-zinc-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors w-52'
          />
        </div>
        <div className='flex gap-2'>
          {[{v:'pending',l:'Pending'},{v:'rejected',l:'Rejected'},{v:'all',l:'All'}].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                filter === f.v ? 'bg-amber-500 text-zinc-900 border-amber-500' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >{f.l}</button>
          ))}
        </div>
        <span className='text-zinc-500 text-xs ml-auto'>{filtered.length} listings</span>
      </div>

      {filtered.length === 0 ? (
        <div className='bg-zinc-900 border border-zinc-800 rounded-2xl py-16 text-center text-zinc-600'>
          <FiInbox className='text-4xl mx-auto mb-2 opacity-30' />
          <p>No {filter === 'all' ? '' : filter} submissions</p>
        </div>
      ) : (
        <div className='space-y-4'>
          {filtered.map(car => (
            <div key={car._id} className='bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden'>
              <div className='flex flex-col sm:flex-row gap-4 p-5'>
                {/* Car Image */}
                <div className='w-full sm:w-32 h-24 rounded-xl bg-zinc-800 flex-shrink-0 overflow-hidden'>
                  {car.image
                    ? <img src={car.image} alt='' className='w-full h-full object-cover' onError={e=>{e.currentTarget.style.display='none';}} />
                    : <BsCarFront className='text-amber-400 text-3xl m-auto mt-7' />
                  }
                </div>

                {/* Car Info */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between gap-2 flex-wrap mb-2'>
                    <div>
                      <p className='text-zinc-100 font-bold text-base'>{car.make} {car.model} <span className='text-zinc-500 font-normal text-sm'>({car.year})</span></p>
                      <p className='text-amber-400 font-black text-sm'>PKR {Number(car.price).toLocaleString()}</p>
                    </div>
                    <Badge status={car.status} />
                  </div>

                  <div className='grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-zinc-400 mb-3'>
                    <span>🚗 {car.type} · {car.fuel} · {car.transmission}</span>
                    <span>📍 {car.seller?.city || '—'}</span>
                    <span>🛣️ {car.mileage ? Number(car.mileage).toLocaleString() + ' km' : '—'}</span>
                    <span>👤 {car.seller?.name || '—'}</span>
                    <span>📞 {car.seller?.phone || '—'}</span>
                    <span>✉️ {car.seller?.email || '—'}</span>
                  </div>

                  {car.description && (
                    <p className='text-zinc-500 text-xs leading-relaxed line-clamp-2'>{car.description}</p>
                  )}
                </div>

                {/* Actions */}
                <div className='flex sm:flex-col gap-2 flex-shrink-0 justify-end'>
                  {car.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(car._id)}
                      disabled={!!acting}
                      className='flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors'
                    >
                      <MdCheckCircle className='text-base' />
                      {acting === car._id + '_approve' ? 'Approving…' : 'Approve'}
                    </button>
                  )}
                  {car.status === 'pending' && (
                    <button
                      onClick={() => handleReject(car._id)}
                      disabled={!!acting}
                      className='flex items-center gap-1.5 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 disabled:opacity-50 text-red-400 font-bold text-xs rounded-xl transition-colors'
                    >
                      <MdCancel className='text-base' />
                      {acting === car._id + '_reject' ? 'Rejecting…' : 'Reject'}
                    </button>
                  )}
                  {car.status === 'rejected' && (
                    <button
                      onClick={() => handleApprove(car._id)}
                      disabled={!!acting}
                      className='flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 disabled:opacity-50 text-emerald-400 font-bold text-xs rounded-xl transition-colors'
                    >
                      <MdCheckCircle className='text-base' />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(car._id)}
                    disabled={!!acting}
                    className='flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 disabled:opacity-50 text-zinc-400 font-bold text-xs rounded-xl transition-colors'
                  >
                    <MdDelete className='text-base' />
                    {acting === car._id + '_delete' ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Photo strip */}
              {car.images?.length > 1 && (
                <div className='flex gap-2 px-5 pb-4 overflow-x-auto'>
                  {car.images.map((url, i) => (
                    <img key={i} src={url} alt='' className='h-14 w-20 object-cover rounded-lg flex-shrink-0' onError={e=>{e.currentTarget.style.display='none';}} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV = [
  { key: 'overview',    label: 'Overview',     icon: FiBarChart2 },
  { key: 'analytics',  label: 'Analytics',    icon: MdTrendingUp },
  { key: 'cars',       label: 'Car Listings', icon: BsCarFront   },
  { key: 'submissions',label: 'Submissions',  icon: FiInbox      },
  { key: 'orders',     label: 'Orders',       icon: FiPackage    },
  { key: 'users',      label: 'Users',        icon: FiUsers      },
  { key: 'reviews',    label: 'Reviews',      icon: MdStar       },
  { key: 'reports',    label: 'Reports',      icon: FiFileText   },
  { key: 'activity',   label: 'Activity Log', icon: MdHistory    },
];

export default function AdminDashboard() {
  const user    = useSelector(selectUser);
  const [active,   setActive]  = useState('overview');
  const [sidebar,  setSidebar] = useState(true);
  const [cars,     setCars]    = useState([]);
  const [orders,   setOrders]  = useState([]);
  const [reports,  setReports] = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAdminCars(), api.getAllOrders(), api.getAllReports()])
      .then(([carsData, ordersData, reportsData]) => {
        setCars(carsData.cars || []);
        setOrders(ordersData.orders || []);
        setReports(reportsData.reports || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openReportsCount    = reports.filter(r => r.status === 'open').length;
  const pendingListingsCount = cars.filter(c => c.status === 'pending').length;

  const currentNav = NAV.find(n => n.key === active);

  return (
    <div className='flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden'>

      {/* Sidebar */}
      <aside className={`${sidebar ? 'w-56' : 'w-16'} flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden`}>
        <div className='flex items-center gap-3 px-4 py-5 border-b border-zinc-800 overflow-hidden'>
          <div className='w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0'>
            <MdDirectionsCar className='text-zinc-900 text-lg' />
          </div>
          {sidebar && <span className='font-black text-white whitespace-nowrap text-base'>Car<span className='text-amber-400'>Mart</span></span>}
        </div>

        <nav className='flex-1 py-3 space-y-0.5 px-2'>
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActive(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active === key ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800'
              } ${!sidebar ? 'justify-center' : ''}`}
            >
              <Icon className='text-base flex-shrink-0' />
              {sidebar && <span className='flex-1 text-left whitespace-nowrap'>{label}</span>}
              {key === 'reports' && openReportsCount > 0 && (
                <span className='bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none flex-shrink-0'>
                  {openReportsCount}
                </span>
              )}
              {key === 'submissions' && pendingListingsCount > 0 && (
                <span className='bg-amber-500 text-zinc-900 text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none flex-shrink-0'>
                  {pendingListingsCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className='border-t border-zinc-800 p-3'>
          <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${!sidebar ? 'justify-center' : ''}`}>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-black text-zinc-900 flex-shrink-0'>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            {sidebar && (
              <div className='min-w-0'>
                <p className='text-xs font-semibold text-zinc-100 truncate'>{user?.name || 'Admin'}</p>
                <p className='text-xs text-zinc-500 truncate'>{user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <header className='h-14 flex items-center justify-between px-5 bg-zinc-900 border-b border-zinc-800 flex-shrink-0'>
          <div className='flex items-center gap-3'>
            <button onClick={() => setSidebar(p => !p)} className='p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all'>
              {sidebar ? <FiChevronLeft className='text-lg' /> : <MdMenu className='text-lg' />}
            </button>
            <div>
              <h1 className='text-base font-bold text-zinc-100'>{currentNav?.label}</h1>
              <p className='text-xs text-zinc-600 hidden sm:block'>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <Link to='/' className='flex items-center gap-1.5 px-3 py-2 text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-xl transition-all'>
            <MdLogout className='text-sm' /> Back to Site
          </Link>
        </header>

        <main className='flex-1 overflow-y-auto p-5'>
          {loading ? (
            <div className='flex items-center justify-center h-64'>
              <svg className='animate-spin h-10 w-10 text-amber-500' viewBox='0 0 24 24' fill='none'>
                <circle cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' className='opacity-25'/>
                <path fill='currentColor' d='M4 12a8 8 0 018-8v8z' className='opacity-75'/>
              </svg>
            </div>
          ) : (
            <div className='max-w-7xl mx-auto'>
              {active === 'overview'    && <Overview cars={cars} orders={orders} openReports={openReportsCount} pendingListings={pendingListingsCount} />}
              {active === 'analytics'  && <Analytics cars={cars} orders={orders} />}
              {active === 'cars'       && <CarListings cars={cars} setCars={setCars} />}
              {active === 'submissions'&& <Submissions cars={cars} setCars={setCars} />}
              {active === 'orders'     && <Orders orders={orders} setOrders={setOrders} />}
              {active === 'users'      && <Users />}
              {active === 'reviews'    && <AllReviews />}
              {active === 'reports'    && <Reports reports={reports} setReports={setReports} />}
              {active === 'activity'   && <ActivityLogTab />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
