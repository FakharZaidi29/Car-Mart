import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { BsStarFill, BsStarHalf } from 'react-icons/bs';
import { MdFormatQuote, MdVerified } from 'react-icons/md';

const TESTIMONIALS = [
  {
    name: 'Ahmed Raza',
    city: 'Lahore',
    role: 'Customer',
    rating: 5,
    avatar: 'A',
    color: 'from-amber-400 to-orange-500',
    text: 'Zabardast experience raha! Maine yahan se KIA Sportage li aur poora process bahut smooth tha. Seller verified tha, paperwork clear tha. CarMart se behtar option Pakistan mein nahi mila.',
  },
  {
    name: 'Sara Malik',
    city: 'Karachi',
    role: 'Customer',
    rating: 5,
    avatar: 'S',
    color: 'from-pink-400 to-rose-500',
    text: 'Maine apni Toyota Corolla 3 din mein sell kar di! Sell Your Car form fill kiya, 24 ghante mein buyers ne contact karna shuru kar diya. Best platform for used cars in Pakistan!',
  },
  {
    name: 'Usman Khan',
    city: 'Islamabad',
    role: 'Seller',
    rating: 5,
    avatar: 'U',
    color: 'from-blue-400 to-indigo-500',
    text: 'As a seller, mujhe bahut acha experience hua. Meri Honda Civic ka listing approved hua aur 2 din mein serious buyers mil gaye. CarMart truly Pakistan ka number one marketplace hai.',
  },
  {
    name: 'Fatima Sheikh',
    city: 'Faisalabad',
    role: 'Customer',
    rating: 4.5,
    avatar: 'F',
    color: 'from-emerald-400 to-teal-500',
    text: 'Pehle mujhe online car khareedne se dar lagta tha, lekin CarMart ne mera confidence badha diya. Verified listings, secure payment aur helpful support team. Highly recommended!',
  },
  {
    name: 'Ali Hassan',
    city: 'Multan',
    role: 'Seller',
    rating: 5,
    avatar: 'A',
    color: 'from-purple-400 to-violet-500',
    text: 'Maine 2 cars CarMart pe list ki hain. Dono 1 hafton mein sell ho gayi. Interface easy hai, buyers serious hote hain aur payment process safe hai. Aage bhi yehi use karunga!',
  },
  {
    name: 'Zara Ahmed',
    city: 'Rawalpindi',
    role: 'Customer',
    rating: 5,
    avatar: 'Z',
    color: 'from-cyan-400 to-sky-500',
    text: 'EMI calculator feature ne mujhe bahut help ki. Main ye decide kar saka ke kaun sa car meri budget mein fit hoga. Suzuki Swift li aur bilkul satisfied hoon. Shukriya CarMart!',
  },
];

function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className='flex gap-0.5'>
      {[...Array(full)].map((_, i) => (
        <BsStarFill key={i} className='text-amber-400 text-sm' />
      ))}
      {half && <BsStarHalf className='text-amber-400 text-sm' />}
    </div>
  );
}

export default function TestimonialsSlider() {
  return (
    <section className='py-20 bg-white dark:bg-zinc-950 transition-colors duration-300'>
      <div className='max-w-6xl mx-auto px-6'>

        {/* Header */}
        <div className='text-center mb-14'>
          <p className='text-amber-500 text-xs font-bold tracking-widest uppercase mb-3'>Real Stories</p>
          <h2 className='text-4xl font-black text-gray-900 dark:text-zinc-100 mb-4'>
            What Our Customers Say
          </h2>
          <p className='text-gray-500 dark:text-zinc-400 text-sm max-w-lg mx-auto'>
            Hazaron Pakistani customers ne CarMart ko choose kiya — unhi ki zubani suno
          </p>
          {/* Star summary */}
          <div className='flex items-center justify-center gap-2 mt-5'>
            <div className='flex gap-0.5'>
              {[...Array(5)].map((_, i) => <BsStarFill key={i} className='text-amber-400 text-base' />)}
            </div>
            <span className='font-black text-gray-900 dark:text-zinc-100'>4.9</span>
            <span className='text-sm text-gray-400 dark:text-zinc-500'>from 10,000+ reviews</span>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true, dynamicBullets: true }}
          breakpoints={{
            640:  { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className='!pb-12'
        >
          {TESTIMONIALS.map((t, i) => (
            <SwiperSlide key={i}>
              <div className='group h-full bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 flex flex-col gap-4 hover:border-amber-300 dark:hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1'>

                {/* Quote icon */}
                <MdFormatQuote className='text-4xl text-amber-300 dark:text-amber-500/40 flex-shrink-0 -mb-2' />

                {/* Review text */}
                <p className='text-gray-600 dark:text-zinc-400 text-sm leading-relaxed flex-1'>
                  {t.text}
                </p>

                {/* Stars */}
                <Stars rating={t.rating} />

                {/* Divider */}
                <div className='h-px bg-gray-100 dark:bg-zinc-800' />

                {/* Author */}
                <div className='flex items-center gap-3'>
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md`}>
                    {t.avatar}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <p className='font-bold text-gray-900 dark:text-zinc-100 text-sm truncate'>{t.name}</p>
                      <MdVerified className='text-blue-500 text-sm flex-shrink-0' />
                    </div>
                    <p className='text-xs text-gray-400 dark:text-zinc-500 truncate'>{t.city} · {t.role}</p>
                  </div>
                </div>

              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
