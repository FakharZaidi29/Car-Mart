const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Car      = require('./models/Car');

dotenv.config();

const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

const CARS = [
  { make:'Toyota', model:'Camry',    year:2023, price:3200000, mileage:12000, fuel:'Petrol', transmission:'Auto',   type:'Sedan',    color:'Pearl White',   badge:'Popular',     featured:true,  image:IMG('1621007947382-bb3c3994e3fb'), description:'Well-maintained Toyota Camry with full service history. Excellent condition inside and out.',       features:['Android Auto','Apple CarPlay','Leather Seats','Sunroof','Backup Camera','Cruise Control'],              seller:{ name:'Ahmed Motors',    city:'Lahore',    rating:4.8, reviews:124, verified:true  } },
  { make:'Honda',  model:'Civic',    year:2022, price:2800000, mileage:18500, fuel:'Petrol', transmission:'Auto',   type:'Sedan',    color:'Midnight Black', badge:null,          image:IMG('1606664515524-ed2f786a0bd6'), description:'Sporty Honda Civic in excellent condition. First owner, accident-free.',                           features:['Touchscreen Display','Bluetooth','Rear Camera','Lane Assist','Push Start','Alloy Wheels'],              seller:{ name:'Sara Autos',      city:'Karachi',   rating:4.6, reviews:89,  verified:true  } },
  { make:'Suzuki', model:'Vitara',   year:2023, price:4100000, mileage:8200,  fuel:'Petrol', transmission:'Auto',   type:'SUV',      color:'Deep Red',       badge:'New Arrival', image:IMG('1549317661-cf369843c7ea'),    description:'Almost new Suzuki Vitara with panoramic roof. Low mileage and full dealership warranty.',            features:['Panoramic Roof','360 Camera','Heated Seats','Auto AC','Keyless Entry','Parking Sensors'],               seller:{ name:'Usman Dealers',   city:'Islamabad', rating:4.7, reviews:56,  verified:true  } },
  { make:'KIA',    model:'Sportage', year:2023, price:5500000, mileage:5000,  fuel:'Petrol', transmission:'Auto',   type:'SUV',      color:'Steel Grey',     badge:'Featured',    featured:true,  image:IMG('1552519507-da3b142c6e3d'),    description:'KIA Sportage AWD with full premium package. Like new condition.',                                    features:['AWD','Ventilated Seats','HUD Display','Wireless Charging','10.25" Touchscreen','ADAS'],                 seller:{ name:'KIA Galaxy',      city:'Lahore',    rating:4.9, reviews:203, verified:true  } },
  { make:'Hyundai',model:'Tucson',   year:2022, price:4800000, mileage:21000, fuel:'Petrol', transmission:'Auto',   type:'SUV',      color:'Aqua Blue',      badge:null,          featured:true,  image:IMG('1541899481282-d53bffe3c35d'), description:'Hyundai Tucson GLS in great condition. Regular servicing done from authorized dealer.',              features:['Panoramic Sunroof','Lane Keep Assist','Blind Spot Monitor','Smart Cruise','Leather Seats','Auto Parking'],seller:{ name:'Bilal Autos',     city:'Karachi',   rating:4.5, reviews:67,  verified:false } },
  { make:'Toyota', model:'Corolla',  year:2021, price:2200000, mileage:35000, fuel:'Petrol', transmission:'Manual', type:'Sedan',    color:'Silver',         badge:'Best Value',  image:IMG('1590362891991-f776e747a588'), description:'Reliable Toyota Corolla XLI. Good fuel economy, well maintained.',                                  features:['Power Windows','Central Locking','CD Player','AC','Power Steering','Airbags'],                          seller:{ name:'Hamza Motors',    city:'Faisalabad',rating:4.3, reviews:34,  verified:false } },
  { make:'Honda',  model:'HR-V',     year:2023, price:3900000, mileage:3500,  fuel:'Hybrid', transmission:'Auto',   type:'SUV',      color:'Champagne Gold', badge:'Hybrid',      featured:true,  image:IMG('1519641471654-76ce0107ad1b'), description:'Honda HR-V Hybrid. Excellent fuel economy, latest tech, barely used.',                              features:['Hybrid Engine','Honda Sensing','Magic Seat','Digital Cluster','Wireless CarPlay','Auto Brake Hold'],     seller:{ name:'Honda City Pvt', city:'Lahore',    rating:4.8, reviews:178, verified:true  } },
  { make:'MG',     model:'HS',       year:2023, price:5200000, mileage:11000, fuel:'Petrol', transmission:'Auto',   type:'SUV',      color:'Starry Black',   badge:null,          image:IMG('1533473359331-0135ef1b58bf'), description:'MG HS Essence with full panoramic roof and ADAS safety suite.',                                     features:['Panoramic Roof','ADAS','360 Camera','Ambient Lighting','Wireless Charging','Heated Seats'],             seller:{ name:'MG Mega Motors', city:'Karachi',   rating:4.6, reviews:92,  verified:true  } },
  { make:'Suzuki', model:'Alto',     year:2022, price:1500000, mileage:22000, fuel:'Petrol', transmission:'Manual', type:'Hatchback',color:'White',          badge:'Budget Pick', image:IMG('1609521263047-f8f205293f24'), description:'Economical Suzuki Alto. Perfect city car with low running costs.',                                  features:['AC','Power Steering','Central Locking','Airbags','Digital Speedometer','USB Charger'],                  seller:{ name:'Tariq Traders',  city:'Multan',    rating:4.2, reviews:28,  verified:false } },
  { make:'Toyota', model:'Fortuner', year:2023, price:8500000, mileage:7500,  fuel:'Diesel', transmission:'Auto',   type:'SUV',      color:'Phantom Brown',  badge:'Premium',     featured:true,  image:IMG('1503376780353-7e6692767b70'), description:'Toyota Fortuner Sigma 4 Diesel. The ultimate family SUV with 4x4 capability.',                    features:['4x4 Drive','7-Seater','Leather Seats','JBL Audio','Cooled Box','Auto Headlamps'],                       seller:{ name:'Toyota Premium', city:'Islamabad', rating:4.9, reviews:312, verified:true  } },
  { make:'Honda',  model:'BRV',      year:2022, price:3600000, mileage:14000, fuel:'Petrol', transmission:'Auto',   type:'MPV',      color:'Lunar Silver',   badge:null,          image:IMG('1555215695-3004980ad54e'),    description:'Honda BR-V 7-seater MPV. Spacious family car in excellent condition.',                              features:['7 Seats','Lane Watch','Bluetooth','Reverse Camera','Auto AC','Smart Entry'],                            seller:{ name:'Sara Autos',      city:'Karachi',   rating:4.6, reviews:89,  verified:true  } },
  { make:'Hyundai',model:'Elantra',  year:2023, price:4200000, mileage:6000,  fuel:'Petrol', transmission:'Auto',   type:'Sedan',    color:'Intense Blue',   badge:'New Arrival', featured:true,  image:IMG('1470119693884-47d3a1d1f180'), description:'All-new Hyundai Elantra N-Line. Sporty sedan with premium features.',                              features:['N-Line Body Kit','Bose Audio','Digital Cluster','Wireless Charging','Sunroof','Sport Drive Mode'],      seller:{ name:'Hyundai Pride',  city:'Lahore',    rating:4.7, reviews:145, verified:true  } },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Car.deleteMany();
    console.log('🗑️  Cleared existing cars');

    await Car.insertMany(CARS);
    console.log(`🚗 Seeded ${CARS.length} cars`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
