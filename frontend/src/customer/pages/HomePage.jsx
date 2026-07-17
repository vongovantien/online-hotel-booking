import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRooms } from '../services/api';
import BookingModal from '../components/BookingModal';
import { useLanguage } from '../../context/LanguageContext';

const BANNERS = [
  { src: '/images/banner1.jpg', alt: 'Banner 1' },
  { src: '/images/banner2.jpg', alt: 'Banner 2' },
  { src: '/images/banner3.jpg', alt: 'Banner 3' },
];

const GALLERY_IMGS = [
  '/images/gallery1.jpg', '/images/gallery2.jpg',
  '/images/gallery3.jpg', '/images/gallery4.jpg',
  '/images/gallery5.jpg', '/images/gallery6.jpg',
  '/images/gallery7.jpg', '/images/gallery8.jpg',
];

const BLOG_POSTS = [
  { img: '/images/blog1.jpg', titleVi: 'Khám Phá Tiện Nghi 5 Sao', titleEn: 'Discover 5-Star Amenities', date: '12/07/2025', descVi: 'Trải nghiệm dịch vụ đẳng cấp với phòng nghỉ sang trọng, hồ bơi vô cực và spa thư giãn cao cấp.', descEn: 'Experience luxury service with elegant rooms, infinity pool, and premium relaxing spa.' },
  { img: '/images/blog2.jpg', titleVi: 'Ẩm Thực Đặc Sắc', titleEn: 'Exquisite Culinary Experience', date: '08/07/2025', descVi: 'Nhà hàng với đầu bếp hàng đầu phục vụ các món ăn địa phương và quốc tế đặc sắc.', descEn: 'Our restaurant with top chefs serving unique local and international cuisine.' },
  { img: '/images/blog3.jpg', titleVi: 'Gói Nghỉ Dưỡng Ưu Đãi', titleEn: 'Special Weekend Packages', date: '01/07/2025', descVi: 'Đặt phòng sớm để nhận ưu đãi lên đến 30% cho các gói nghỉ dưỡng cuối tuần.', descEn: 'Book early to get up to 30% discount on weekend getaway packages.' },
];

// ─── Hero Carousel ────────────────────────────────────────────────────────────

function HeroCarousel({ t }) {
  const [current, setCurrent] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');

  useEffect(() => {
    const id = setInterval(() => setCurrent(c => (c + 1) % BANNERS.length), 4000);
    return () => clearInterval(id);
  }, []);

  const handleBook = (e) => {
    e.preventDefault();
    window.location.hash = '#rooms-section';
  };

  return (
    <section className="banner_main">
      <div className="carousel slide banner">
        <ol className="carousel-indicators">
          {BANNERS.map((_, i) => (
            <li key={i} className={i === current ? 'active' : ''} onClick={() => setCurrent(i)} />
          ))}
        </ol>
        <div className="carousel-inner">
          {BANNERS.map((b, i) => (
            <div key={i} className={`carousel-item${i === current ? ' active' : ''}`}>
              <img src={b.src} alt={b.alt} style={{ width: '100%', minHeight: 500, objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="booking_ocline">
        <div className="container">
          <div className="row">
            <div className="col-md-5">
              <div className="book_room">
                <h1>{t('home.heroTitle')}</h1>
                <form className="book_now" onSubmit={handleBook}>
                  <div className="row">
                    <div className="col-md-12">
                      <span>{t('home.arrival')}</span>
                      <img className="date_cua" src="/images/date.png" alt="" />
                      <input
                        className="online_book"
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-12">
                      <span>{t('home.departure')}</span>
                      <img className="date_cua" src="/images/date.png" alt="" />
                      <input
                        className="online_book"
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="col-md-12">
                      <Link to="/rooms" className="book_btn">{t('home.bookNow')}</Link>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About Section ─────────────────────────────────────────────────────────────

function AboutSection({ t }) {
  return (
    <div className="about">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-5">
            <div className="titlepage">
              <h2>{t('home.aboutTitle')}</h2>
              <p>{t('home.aboutDesc')}</p>
              <Link className="read_more" to="/about">{t('home.readMore')}</Link>
            </div>
          </div>
          <div className="col-md-7">
            <div className="about_img">
              <figure><img src="/images/about.png" alt="About us" /></figure>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rooms Preview Section ──────────────────────────────────────────────────────

const ROOM_IMGS = [
  '/images/room1.jpg', '/images/room2.jpg', '/images/room3.jpg',
  '/images/room4.jpg', '/images/room5.jpg', '/images/room6.jpg',
];

function RoomsPreviewSection({ t }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    getRooms().then(data => setRooms(data.slice(0, 6))).catch(() => {});
  }, []);

  const displayRooms = rooms.length > 0 ? rooms : Array.from({ length: 6 }, (_, i) => ({
    id: `static-${i}`, roomNumber: `10${i + 1}`,
    roomTypeName: ['A', 'B', 'C'][i % 3],
    basePrice: [150000, 170000, 200000][i % 3],
    status: 'AVAILABLE',
  }));

  return (
    <div id="rooms-section" className="our_room">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>{t('home.roomsTitle')}</h2>
              <p>{t('home.roomsSub')}</p>
            </div>
          </div>
        </div>
        <div className="row">
          {displayRooms.map((room, i) => (
            <div key={room.id} className="col-md-4 col-sm-6">
              <div id="serv_hover" className="room">
                <div className="room_img">
                  <figure>
                    <img src={ROOM_IMGS[i % ROOM_IMGS.length]} alt={`Room ${room.roomNumber}`} />
                  </figure>
                </div>
                <div className="bed_room">
                  <h3>Phòng {room.roomNumber} — {t('rooms.typePrefix')} {room.roomTypeName}</h3>
                  <p style={{ marginBottom: 8 }}>
                    {Number(room.basePrice).toLocaleString('vi-VN')} {t('home.pricePerDay')}
                  </p>
                  <span style={{
                    display: 'inline-block', padding: '2px 12px', borderRadius: 20, fontSize: 12,
                    background: room.status === 'AVAILABLE' ? '#e6f9ee' : '#ffe0e0',
                    color: room.status === 'AVAILABLE' ? '#0a7c3e' : '#c00',
                    marginBottom: 12,
                  }}>
                    {room.status === 'AVAILABLE' ? t('home.available') : t('home.rented')}
                  </span>
                  {room.status === 'AVAILABLE' && (
                    <button
                      className="read_more"
                      style={{ display: 'block', margin: '0 auto', border: 'none', cursor: 'pointer' }}
                      onClick={() => setSelectedRoom(room)}
                    >
                      {t('rooms.bookRoom')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row">
          <div className="col-md-12" style={{ textAlign: 'center', marginTop: 20, marginBottom: 10 }}>
            <Link to="/rooms" className="read_more">{t('home.viewAllRooms')}</Link>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
}

// ─── Gallery Section ───────────────────────────────────────────────────────────

function GallerySection({ t }) {
  return (
    <div className="gallery">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage"><h2>{t('home.galleryTitle')}</h2></div>
          </div>
        </div>
        <div className="row">
          {GALLERY_IMGS.map((src, i) => (
            <div key={i} className="col-md-3 col-sm-6">
              <div className="gallery_img">
                <figure><img src={src} alt={`Gallery ${i + 1}`} /></figure>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Blog Section ──────────────────────────────────────────────────────────────

function BlogSection({ t, lang }) {
  return (
    <div className="blog">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage">
              <h2>{t('home.blogTitle')}</h2>
              <p>{t('home.blogSub')}</p>
            </div>
          </div>
        </div>
        <div className="row">
          {BLOG_POSTS.map((post, i) => (
            <div key={i} className="col-md-4">
              <div className="blog_box">
                <div className="blog_img">
                  <figure><img src={post.img} alt={post.titleVi} /></figure>
                </div>
                <div className="blog_room">
                  <h3>{lang === 'vi' ? post.titleVi : post.titleEn}</h3>
                  <span>{post.date}</span>
                  <p>{lang === 'vi' ? post.descVi : post.descEn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Contact Section ───────────────────────────────────────────────────────────

function ContactSection({ t }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="contact">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="titlepage"><h2>{t('home.contactTitle')}</h2></div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6">
            {sent ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 50, marginBottom: 12 }}>📨</div>
                <h3 style={{ color: '#121212' }}>{t('contact.sentTitle')}</h3>
                <p>{t('contact.sentDesc')}</p>
                <button className="send_btn" style={{ marginTop: 16 }} onClick={() => setSent(false)}>
                  {t('contact.sendAgain')}
                </button>
              </div>
            ) : (
              <form id="request" className="main_form" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-12">
                    <input className="contactus" placeholder={t('contact.name')} type="text"
                      value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div className="col-md-12">
                    <input className="contactus" placeholder={t('contact.email')} type="email"
                      value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                  </div>
                  <div className="col-md-12">
                    <input className="contactus" placeholder={t('contact.phone')} type="tel"
                      value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                  <div className="col-md-12">
                    <textarea className="textarea" placeholder={t('contact.message')}
                      value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                  </div>
                  <div className="col-md-12">
                    <button type="submit" className="send_btn">{t('contact.send')}</button>
                  </div>
                </div>
              </form>
            )}
          </div>
          <div className="col-md-6">
            <div className="map_main">
              <div className="map-responsive">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSG8gQ2hpIE1pbmg!5e0!3m2!1sen!2s!4v1234567890"
                  width="600" height="400" style={{ border: 0, width: '100%' }}
                  allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  title="Hotel Location"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t, lang } = useLanguage();
  return (
    <>
      <HeroCarousel t={t} />
      <AboutSection t={t} />
      <RoomsPreviewSection t={t} />
      <GallerySection t={t} />
      <BlogSection t={t} lang={lang} />
      <ContactSection t={t} />
    </>
  );
}
