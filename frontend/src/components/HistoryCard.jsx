import { useEffect,useCallback } from "react";

export const HistoryCard = ({ item, onDelete }) => {
  const [objectUrl, setObjectUrl] = useState('');
    const [history, setHistory] = useState([]);

  const loadHistory = useCallback(async () => {
    try { setHistory(await getImages()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

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
    <div className="history-card">
      {src && <img src={src} alt={item.prompt} className="history-image" />}
      <div className="history-overlay">
        <p className="history-prompt">{item.prompt}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={download}>
            Download
          </button>
          <button className="delete-btn" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }} onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};