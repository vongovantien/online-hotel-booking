import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutPage() {
  const { t, lang } = useLanguage();

  return (
    <>
      <PageBanner title={t('nav.about')} />

      <div className="about" style={{ paddingTop: 60 }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-5">
              <div className="titlepage" style={{ maxWidth: 'inherit' }}>
                <h2>{t('home.aboutTitle')}</h2>
                {lang === 'vi' ? (
                  <>
                    <p>
                      Khách sạn của chúng tôi tọa lạc tại vị trí trung tâm, mang đến sự kết hợp hoàn
                      hảo giữa tiện nghi hiện đại và không gian ấm cúng. Với đội ngũ nhân viên tận tụy
                      và chuyên nghiệp, chúng tôi cam kết mỗi kỳ lưu trú của bạn đều trở thành một
                      trải nghiệm đáng nhớ.
                    </p>
                    <p style={{ marginTop: 16 }}>
                      Chúng tôi cung cấp 3 loại phòng đa dạng — Tiêu chuẩn (A), Cao cấp (B) và VIP (C)
                      — phù hợp với nhu cầu và ngân sách của từng khách hàng. Mỗi phòng đều được trang
                      bị đầy đủ tiện nghi, từ điều hòa, TV màn hình phẳng đến phòng tắm riêng sang trọng.
                    </p>
                  </>
                ) : (
                  <>
                    <p>
                      Our hotel is centrally located, offering a perfect blend of modern amenities
                      and a cozy, welcoming atmosphere. With our dedicated and professional staff,
                      we commit to making every stay of yours a memorable experience.
                    </p>
                    <p style={{ marginTop: 16 }}>
                      We offer 3 distinct room types — Standard (A), Superior (B), and VIP (C)
                      — tailored to fit every guest's needs and budget. Each room is fully equipped
                      with high-end facilities, including air conditioning, flat-screen TV, and luxurious private bath.
                    </p>
                  </>
                )}
                <a className="read_more" href="#contact">{t('home.contactTitle')}</a>
              </div>
            </div>
            <div className="col-md-7">
              <div className="about_img">
                <figure><img src="/images/about.png" alt="About our hotel" /></figure>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: '#f4f5f7', padding: '60px 0', marginTop: 60 }}>
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div className="titlepage">
                <h2>{lang === 'vi' ? 'Tại Sao Chọn Chúng Tôi' : 'Why Choose Us'}</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {(lang === 'vi' ? [
              { icon: '🏨', title: '15+ Phòng', desc: 'Đa dạng loại phòng phù hợp mọi nhu cầu' },
              { icon: '🔒', title: 'An Toàn', desc: 'Hệ thống bảo mật 24/7 đảm bảo an toàn' },
              { icon: '🍽️', title: 'Ẩm Thực', desc: 'Nhà hàng phục vụ món Việt và quốc tế' },
              { icon: '📍', title: 'Vị Trí Đẹp', desc: 'Trung tâm thành phố, tiện di chuyển' },
              { icon: '🌟', title: 'Dịch Vụ 5⭐', desc: 'Đội ngũ phục vụ chuyên nghiệp, tận tâm' },
              { icon: '💻', title: 'WiFi Miễn Phí', desc: 'Tốc độ cao trong toàn bộ khách sạn' },
            ] : [
              { icon: '🏨', title: '15+ Rooms', desc: 'Diverse room types for every need' },
              { icon: '🔒', title: 'Safe & Secure', desc: '24/7 security system ensuring safety' },
              { icon: '🍽️', title: 'Fine Dining', desc: 'Restaurant serving local & global dishes' },
              { icon: '📍', title: 'Prime Location', desc: 'City center, easy transportation' },
              { icon: '🌟', title: '5⭐ Service', desc: 'Professional & dedicated staff' },
              { icon: '💻', title: 'Free WiFi', desc: 'High-speed internet throughout hotel' },
            ]).map(({ icon, title, desc }) => (
              <div key={title} className="col-md-4 col-sm-6" style={{ marginBottom: 30 }}>
                <div style={{ background: '#fff', padding: '30px 24px', borderRadius: 8, textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
                  <h4 style={{ fontWeight: 700, marginBottom: 8, color: '#121212' }}>{title}</h4>
                  <p style={{ color: '#666', fontSize: 14 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
