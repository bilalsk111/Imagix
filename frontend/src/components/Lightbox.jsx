import { useEffect } from 'react';

const Lightbox = ({ image, onClose }) => {
  useEffect(() => {
    if (!image) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <img
        src={image}
        alt="Full screen preview"
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;