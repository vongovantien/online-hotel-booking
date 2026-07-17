import PageBanner from '../components/PageBanner';

const IMAGES = Array.from({ length: 8 }, (_, i) => ({
  src: `/images/gallery${i + 1}.jpg`,
  alt: `Gallery image ${i + 1}`,
}));

export default function GalleryPage() {
  return (
    <>
      <PageBanner title="Gallery" />
      <div className="gallery inner_page" style={{ paddingTop: 60 }}>
        <div className="container">
          <div className="row">
            {IMAGES.map(({ src, alt }, i) => (
              <div key={i} className="col-md-3 col-sm-6">
                <div className="gallery_img" style={{ marginBottom: 30 }}>
                  <figure><img src={src} alt={alt} /></figure>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
