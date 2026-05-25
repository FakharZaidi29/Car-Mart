const express = require('express');
const { getCars, getCar, createCar, updateCar, deleteCar, submitListing, approveListing, rejectListing, getMyListings, getStats } = require('../controllers/carController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', getStats);
router.get('/',      getCars);
router.get('/:id',   getCar);
router.get('/my',             protect,            getMyListings);
router.post('/listings',      protect,            submitListing);
router.post('/',              protect, adminOnly, createCar);
router.put('/:id/approve',    protect, adminOnly, approveListing);
router.put('/:id/reject',     protect, adminOnly, rejectListing);
router.put('/:id',            protect, adminOnly, updateCar);
router.delete('/:id',         protect, adminOnly, deleteCar);

module.exports = router;
