import { useState, useEffect } from 'react';

const HistoryCard = ({ item, index, onDelete, onOpenFull }) => {
  const [objectUrl, setObjectUrl] = useState('');

  useEffect(() => {
    if (!item.imageBlob) return;
    const url = URL.createObjectURL(item.imageBlob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [item.imageBlob]);

  const download = () => {
    const a = document.createElement('a');
    a.href = objectUrl || item.imageUrl;
    a.download = `imagix-${item.createdAt || Date.now()}.jpg`;
    a.click();
  };

  const src = objectUrl || item.imageUrl;

  return (
    <div className="history-card" style={{ animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + (index || 0) * 0.05}s both` }}>
      {src && <img src={src} alt={item.prompt} className="history-image" />}
      <div className="history-overlay">
        <p className="history-prompt">{item.prompt}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOpenFull(src)}>
            Open Full
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={download}>
            Download
          </button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
