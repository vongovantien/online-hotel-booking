import { useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';

const IMAGES = [
  { src: '/images/gallery1.jpg', title: 'Phòng Suite Hạng Sang', desc: 'Giường King-size, tầm nhìn toàn cảnh thành phố' },
  { src: '/images/gallery2.jpg', title: 'Sảnh Đón Tiếp', desc: 'Thiết kế sang trọng, đèn chùm pha lê' },
  { src: '/images/gallery3.jpg', title: 'Hồ Bơi Vô Cực', desc: 'Tầng thượng, view biển hoàng hôn' },
  { src: '/images/gallery4.jpg', title: 'Nhà Hàng Fine Dining', desc: 'Ẩm thực cao cấp, nến và pha lê' },
  { src: '/images/gallery5.jpg', title: 'Spa & Wellness', desc: 'Liệu pháp thư giãn, không gian Zen' },
  { src: '/images/gallery6.jpg', title: 'Phòng Gym Hiện Đại', desc: 'Trang thiết bị thể thao quốc tế' },
  { src: '/images/gallery7.jpg', title: 'Phòng Tắm Suite', desc: 'Bồn tắm đá cẩm thạch, vòi sen mưa' },
  { src: '/images/gallery8.jpg', title: 'Phòng Hội Nghị', desc: 'Trung tâm doanh nhân, công nghệ hiện đại' },
];

export default function GalleryPage() {
  const { t } = useLanguage();
  const [lightbox, setLightbox] = useState(null);

  const openLightbox = (i) => setLightbox(i);
  const closeLightbox = () => setLightbox(null);
  const goPrev = () => setLightbox((prev) => (prev > 0 ? prev - 1 : IMAGES.length - 1));
  const goNext = () => setLightbox((prev) => (prev < IMAGES.length - 1 ? prev + 1 : 0));

  return (
    <>
      <PageBanner title={t('nav.gallery') || 'Gallery'} />

      <div style={{ paddingTop: 50, paddingBottom: 80, background: '#fafafa' }}>
        <div className="container" style={{ maxWidth: 1200 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#121212', margin: 0 }}>
              Khám Phá Không Gian Của Chúng Tôi
            </h2>
            <p style={{ color: '#888', marginTop: 8, fontSize: 15 }}>
              Trải nghiệm sang trọng, đẳng cấp 5 sao tại mọi ngóc ngách
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}>
            {IMAGES.map((img, i) => (
              <div
                key={i}
                onClick={() => openLightbox(i)}
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  aspectRatio: '4/3',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)';
                }}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  padding: '40px 16px 16px',
                }}>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{img.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 }}>{img.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.92)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            style={{
              position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 48, height: 48, borderRadius: '50%', fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ‹
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh', textAlign: 'center' }}>
            <img
              src={IMAGES[lightbox].src}
              alt={IMAGES[lightbox].title}
              style={{
                maxWidth: '100%', maxHeight: '75vh', borderRadius: 12,
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
              }}
            />
            <div style={{ color: '#fff', marginTop: 16, fontSize: 18, fontWeight: 700 }}>
              {IMAGES[lightbox].title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 }}>
              {IMAGES[lightbox].desc} — {lightbox + 1}/{IMAGES.length}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            style={{
              position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
              width: 48, height: 48, borderRadius: '50%', fontSize: 22, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ›
          </button>
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: 20, right: 24, background: 'none',
              border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
