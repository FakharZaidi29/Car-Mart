const BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('carmart_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
  ...extra,
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  // Auth extras
  updateMe:        (body)      => fetch(`${BASE}/auth/me`,               { method: 'PUT',  headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateAvatar:    (avatar)    => fetch(`${BASE}/auth/me/avatar`,        { method: 'PUT',  headers: headers(), body: JSON.stringify({ avatar }) }).then(handle),
  forgotPassword:  (email)     => fetch(`${BASE}/auth/forgot-password`,  { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).then(handle),
  resetPassword:   (token, password) => fetch(`${BASE}/auth/reset-password/${token}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }).then(handle),

  // Cars
  getMyListings:  () => fetch(`${BASE}/cars/my`, { headers: headers() }).then(handle),
  getStats:       () => fetch(`${BASE}/cars/stats`).then(handle),
  getCars:      (params = {}) => fetch(`${BASE}/cars?${new URLSearchParams(params)}`).then(handle),
  getAdminCars: ()            => fetch(`${BASE}/cars?admin=true`, { headers: headers() }).then(handle),
  getCar:    (id)          => fetch(`${BASE}/cars/${id}`).then(handle),
  createCar: (body)        => fetch(`${BASE}/cars`,     { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateCar: (id, body)    => fetch(`${BASE}/cars/${id}`,{ method: 'PUT',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  deleteCar: (id)          => fetch(`${BASE}/cars/${id}`,{ method: 'DELETE',headers: headers() }).then(handle),

  // Seller listing
  submitListing: (body) => fetch(`${BASE}/cars/listings`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),

  // Orders
  createOrder:       (body)         => fetch(`${BASE}/orders`,            { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMyOrders:       ()             => fetch(`${BASE}/orders/my`,         { headers: headers() }).then(handle),
  getAllOrders:       ()             => fetch(`${BASE}/orders`,            { headers: headers() }).then(handle),
  updateOrderStatus: (id, status)   => fetch(`${BASE}/orders/${id}/status`,{ method: 'PUT',  headers: headers(), body: JSON.stringify({ status }) }).then(handle),

  // AI Chat
  aiChat: (messages, context) => fetch(`${BASE}/ai/chat`, { method: 'POST', headers: headers(), body: JSON.stringify({ messages, context }) }).then(handle),

  // Reviews
  getReviews:    (carId)          => fetch(`${BASE}/reviews/car/${carId}`).then(handle),
  createReview:  (carId, body)    => fetch(`${BASE}/reviews/car/${carId}`, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateReview:  (reviewId, body) => fetch(`${BASE}/reviews/${reviewId}`,  { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle),
  deleteReview:  (reviewId)       => fetch(`${BASE}/reviews/${reviewId}`,  { method: 'DELETE', headers: headers() }).then(handle),

  // Reports / Support
  createReport:    (body) => fetch(`${BASE}/reports`,           { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  getMyReports:    ()     => fetch(`${BASE}/reports/my`,        { headers: headers() }).then(handle),
  getAllReports:   ()     => fetch(`${BASE}/reports`,           { headers: headers() }).then(handle),
  updateReportStatus: (id, status) => fetch(`${BASE}/reports/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handle),
  deleteReport:    (id)   => fetch(`${BASE}/reports/${id}`,     { method: 'DELETE',  headers: headers() }).then(handle),

  // Users (admin)
  getAllUsers:     ()           => fetch(`${BASE}/users`,           { headers: headers() }).then(handle),
  updateUserRole:  (id, role)  => fetch(`${BASE}/users/${id}/role`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ role }) }).then(handle),
  deleteUser:      (id)        => fetch(`${BASE}/users/${id}`,      { method: 'DELETE', headers: headers() }).then(handle),

  // Reviews (admin)
  getAllReviews:   ()    => fetch(`${BASE}/reviews/admin/all`, { headers: headers() }).then(handle),

  // Activity log (admin)
  getActivity:    ()    => fetch(`${BASE}/activity`, { headers: headers() }).then(handle),

  // Listing approval
  approveListing: (id) => fetch(`${BASE}/cars/${id}/approve`, { method: 'PUT', headers: headers() }).then(handle),
  rejectListing:  (id) => fetch(`${BASE}/cars/${id}/reject`,  { method: 'PUT', headers: headers() }).then(handle),

  // Newsletter
  subscribeNewsletter: (email) => fetch(`${BASE}/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).then(handle),

  // Upload
  uploadImage: (formData) => fetch(`${BASE}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  }).then(handle),
};
