import { useState } from 'react';
import PageBanner from '../components/PageBanner';
import { useLanguage } from '../../context/LanguageContext';

export default function ContactPage() {
  const { t, lang } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <>
      <PageBanner title={t('nav.contact')} />

      <div className="contact" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div className="container">
          <div className="row">
            {/* Form */}
            <div className="col-md-6">
              {sent ? (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>📨</div>
                  <h3 style={{ color: '#121212', fontSize: 24, marginBottom: 12 }}>{t('contact.sentTitle')}</h3>
                  <p style={{ color: '#666', marginBottom: 24 }}>
                    {t('contact.sentDesc')}
                  </p>
                  <button className="send_btn" onClick={() => setSent(false)}>
                    {t('contact.sendAgain')}
                  </button>
                </div>
              ) : (
                <form id="request" className="main_form" onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-12">
                      <input className="contactus" placeholder={t('contact.name') + ' *'} type="text"
                        value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div className="col-md-12">
                      <input className="contactus" placeholder={t('contact.email') + ' *'} type="email"
                        value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                    </div>
                    <div className="col-md-12">
                      <input className="contactus" placeholder={t('contact.phone')} type="tel"
                        value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="col-md-12">
                      <textarea className="textarea" placeholder={t('contact.message') + ' *'}
                        value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                    </div>
                    <div className="col-md-12">
                      <button type="submit" className="send_btn">{t('contact.send')}</button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* Map + Contact info */}
            <div className="col-md-6">
              <div className="map_main" style={{ marginBottom: 30 }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zSG8gQ2hpIE1pbmg!5e0!3m2!1sen!2s!4v1234567890"
                  width="600" height="300" style={{ border: 0, width: '100%', borderRadius: 8 }}
                  allowFullScreen loading="lazy" title="Hotel Location"
                />
              </div>

              <div style={{ background: '#f9f9f9', padding: '24px', borderRadius: 8 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 16, color: '#121212', borderBottom: '3px solid #ff0909', paddingBottom: 8, display: 'table' }}>
                  {lang === 'vi' ? 'Thông Tin Liên Hệ' : 'Contact Information'}
                </h4>
                {[
                  { icon: 'fa-map-marker', text: '123 Hotel Street, Q1, TP.HCM' },
                  { icon: 'fa-phone',      text: '+84 123 456 789' },
                  { icon: 'fa-mobile',     text: '+84 987 654 321' },
                  { icon: 'fa-envelope',   text: 'hotel@example.com' },
                  { icon: 'fa-clock-o',    text: lang === 'vi' ? 'Mở cửa 24/7' : 'Open 24/7' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <i className={`fa ${icon}`} style={{ color: '#ff0909', width: 20, textAlign: 'center' }} />
                    <span style={{ color: '#555', fontSize: 15 }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
