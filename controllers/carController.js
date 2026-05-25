const Car   = require('../models/Car');
const User  = require('../models/User');
const Order = require('../models/Order');
const log   = require('../utils/logger');
const { sendListingEmail } = require('../utils/mailer');

// @route  GET /api/cars
// @access Public
const getCars = async (req, res) => {
  try {
    const { make, type, fuel, transmission, minPrice, maxPrice, minMileage, maxMileage, q, sort, page = 1, limit = 20, admin, featured } = req.query;

    const filter = admin === 'true' ? {} : { status: 'available' };

    if (featured === 'true')            filter.featured = true;
    if (make && make !== 'All')         filter.make = make;
    if (type && type !== 'All')         filter.type = type;
    if (fuel && fuel !== 'All')         filter.fuel = fuel;
    if (transmission && transmission !== 'All') filter.transmission = transmission;
    if (minPrice || maxPrice)           filter.price = { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) };
    if (minMileage || maxMileage)       filter.mileage = { ...(minMileage && { $gte: Number(minMileage) }), ...(maxMileage && { $lte: Number(maxMileage) }) };
    if (q)                              filter.$text = { $search: q };

    const sortMap = {
      newest:     { createdAt: -1 },
      oldest:     { createdAt:  1 },
      price_asc:  { price:      1 },
      price_desc: { price:     -1 },
      mileage:    { mileage:    1 },
    };
    const sortBy = sortMap[sort] || sortMap.newest;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Car.countDocuments(filter);
    const cars  = await Car.find(filter).sort(sortBy).skip(skip).limit(Number(limit));

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/cars/:id
// @access Public
const getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/cars
// @access Private/Admin
const createCar = async (req, res) => {
  try {
    const car = await Car.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/cars/:id
// @access Private/Admin
const updateCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/cars/:id
// @access Private/Admin
const deleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, message: 'Car deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/listings
// @access Public — anyone can submit a used car listing
const submitListing = async (req, res) => {
  try {
    const { make, model, year, price, mileage, fuel, transmission, type, color, description, name, phone, email, city } = req.body;

    if (!make || !model || !year || !price || !name || !phone) {
      return res.status(400).json({ success: false, message: 'Make, model, year, price, name and phone are required' });
    }

    // Map 'Automatic' → 'Auto' (form sends full word, model needs short form)
    const transmissionMapped = transmission === 'Automatic' ? 'Auto' : 'Manual';

    const car = await Car.create({
      make, model,
      year:         Number(year),
      price:        Number(price),
      mileage:      Number(mileage) || 0,
      fuel:         fuel || 'Petrol',
      transmission: transmissionMapped,
      type:         type || 'Sedan',
      color:        color || '',
      description:  description || '',
      listingType:  'used',
      status:       'pending',
      createdBy:    req.user?._id,
      seller: {
        name:     name,
        city:     city || '',
        phone:    phone,
        email:    email || '',
        rating:   0,
        reviews:  0,
        verified: false,
      },
    });

    res.status(201).json({ success: true, car });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const approveListing = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'available' }, { new: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    await log(req.user._id, req.user.name, 'approve_listing', `Approved listing: ${car.make} ${car.model} ${car.year}`);
    if (car.seller?.email) {
      sendListingEmail({ to: car.seller.email, name: car.seller.name, carMake: car.make, carModel: car.model, carYear: car.year, approved: true }).catch(() => {});
    }
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const rejectListing = async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    await log(req.user._id, req.user.name, 'reject_listing', `Rejected listing: ${car.make} ${car.model} ${car.year}`);
    if (car.seller?.email) {
      sendListingEmail({ to: car.seller.email, name: car.seller.name, carMake: car.make, carModel: car.model, carYear: car.year, approved: false }).catch(() => {});
    }
    res.json({ success: true, car });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMyListings = async (req, res) => {
  try {
    const cars = await Car.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/cars/stats
// @access Public
const getStats = async (req, res) => {
  try {
    const [totalCars, totalSellers, totalOrders, carsByType, carsByMake] = await Promise.all([
      Car.countDocuments({ status: 'available' }),
      User.countDocuments({ role: { $in: ['seller', 'admin'] } }),
      Order.countDocuments(),
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Car.aggregate([
        { $match: { status: 'available' } },
        { $group: { _id: '$make', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),
    ]);

    res.json({
      success: true,
      totalCars,
      totalSellers,
      totalOrders,
      carsByType: Object.fromEntries(carsByType.map(({ _id, count }) => [_id, count])),
      carsByMake: carsByMake.map(({ _id, count }) => ({ name: _id, cars: count })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCars, getCar, createCar, updateCar, deleteCar, submitListing, approveListing, rejectListing, getMyListings, getStats };
