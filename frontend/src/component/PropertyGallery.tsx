import { useState, useEffect } from 'react';

function PropertyGallery({ images }: { images: string[] }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) return (
        <div className='galleryEmpty'>
            <i className='fa-regular fa-image' />
            <span>No images available</span>
        </div>
    );

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };

    useEffect(() => {
        lightboxOpen ? document.body.style.overflow = 'hidden' : document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [lightboxOpen]);

    const prev = () => setActiveIndex(i => (i - 1 + images.length) % images.length);
    const next = () => setActiveIndex(i => (i + 1) % images.length);

    return (
        <>
            <div className='propertyGallery'>
                <div className='galleryItem' onClick={() => openLightbox(0)}>
                    <img src={images[0]} alt='Property 1' />

                    {images.length > 1 && (
                        <div className='moreBadge'>+{images.length - 1}</div>
                    )}
                </div>
            </div>

            {lightboxOpen && (
                <div className='lightboxOverlay' onClick={() => setLightboxOpen(false)}>
                    <div className='lightboxContent' onClick={e => e.stopPropagation()}>
                        <button className='lightboxClose' onClick={() => setLightboxOpen(false)}>✕</button>

                        <button className='lightboxPrev' onClick={prev}>‹</button>
                        <img src={images[activeIndex]} alt={`Property ${activeIndex + 1}`} />
                        <button className='lightboxNext' onClick={next}>›</button>

                        <div className='lightboxCounter'>
                            {activeIndex + 1} / {images.length}
                        </div>

                        <div className='lightboxThumbs'>
                            {images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Thumb ${i + 1}`}
                                    className={`lightboxThumb ${i === activeIndex ? 'active' : ''}`}
                                    onClick={() => setActiveIndex(i)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PropertyGallery;