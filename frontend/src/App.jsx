import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PWABadge from './PWABadge.jsx';
import { saveImage, getImages, deleteImage } from './db.js';
import './App.css';

// ─── History Card ─────────────────────────────────────────────────────────────
const HistoryCard = ({ item, onDelete, onOpenFull }) => {
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
    <div className="history-card">
      {src && <img src={src} alt={item.prompt} className="history-image" />}
      <div className="history-overlay">
        <p className="history-prompt">{item.prompt}</p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button className="btn secondary small-btn" onClick={() => onOpenFull(src)}>
            Open Full
          </button>
          <button className="btn secondary small-btn" onClick={download}>
            Download
          </button>
          <button className="delete-btn small-btn" onClick={() => onDelete(item.id)}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const [prompt, setPrompt] = useState('');
  const [shouldEnhance, setShouldEnhance] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | enhancing_prompt | generating | done | error
  const [imageUrl, setImageUrl] = useState('');
  const [usedPrompt, setUsedPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const loadHistory = useCallback(async () => {
    try { setHistory(await getImages()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleEnhanceToggle = async (e) => {
    const isChecked = e.target.checked;
    setShouldEnhance(isChecked);

    if (isChecked && prompt.trim()) {
      setStatus('enhancing_prompt');
      try {
        const { data } = await axios.post('/api/image/enhance', { prompt: prompt.trim() });
        if (data.success && data.data.enhancedPrompt) {
          setPrompt(data.data.enhancedPrompt);
        }
      } catch (err) {
        console.error("Enhance failed", err);
      } finally {
        setStatus('idle');
      }
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setErrorMsg('');
    setImageUrl('');
    setUsedPrompt('');
    setStatus('generating');

    try {
      const { data } = await axios.post('/api/image/generate', {
        prompt: prompt.trim(),
        enhancePrompt: false, // Already enhanced in the UI if they toggled it
      });

      if (!data.success) throw new Error(data.message || 'Server error');

      const { image, usedPrompt: up } = data.data;
      setImageUrl(image);
      setUsedPrompt(up);
      setStatus('done');

      // Save to IndexedDB — try fetching blob, fallback to storing URL only
      try {
        const imgRes = await fetch(image);
        const imgBlob = await imgRes.blob();
        await saveImage({ prompt: prompt.trim(), imageBlob: imgBlob });
      } catch {
        await saveImage({ prompt: prompt.trim(), imageUrl: image });
      } finally {
        await loadHistory();
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      setErrorMsg(typeof msg === 'string' ? msg : JSON.stringify(msg));
      setStatus('error');
    }
  };

  const downloadMain = async () => {
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `imagix-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch (e) { console.error('Download failed:', e); }
  };

  const handleDelete = async (id) => {
    await deleteImage(id);
    await loadHistory();
  };

  const isLoading = status === 'enhancing_prompt' || status === 'generating';

  return (
    <div className="app-container">
      <div className="ambient-background"></div>
      
      <header className="header">
        <h1 className="title">Imagix AI</h1>
        <p className="subtitle">Craft stunning visuals with Midjourney-style enhancement.</p>
      </header>

      <main className="card glass-effect">
        {status === 'error' && errorMsg && (
          <div className="error-message">
            <span>{errorMsg}</span>
            <button className="btn error-retry" onClick={generate}>
              Retry
            </button>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="prompt-input" className="input-label">Describe your vision</label>
          <div className="textarea-wrapper">
            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A futuristic city with flying cars at sunset, cinematic lighting, ultra-detailed..."
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey && !isLoading && prompt.trim()) generate(); }}
            />
            {status === 'enhancing_prompt' && (
              <div className="textarea-loader">
                <div className="loader small" />
                <span>Enhancing...</span>
              </div>
            )}
          </div>

          <div className="actions-row">
            <label className="enhance-toggle" htmlFor="enhance-checkbox">
              <div className="switch">
                <input
                  id="enhance-checkbox"
                  type="checkbox"
                  checked={shouldEnhance}
                  onChange={handleEnhanceToggle}
                  disabled={isLoading}
                />
                <span className="slider round"></span>
              </div>
              <span className="enhance-label">✨ Auto-Enhance Prompt</span>
            </label>

            <button
              className="btn primary-gradient"
              onClick={generate}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading && status === 'generating'
                ? <><div className="loader" />Generating...</>
                : 'Generate Image'}
            </button>
          </div>
        </div>

        {imageUrl && (
          <div className="result-group">
            <div className="result-header">
              <label>Your Masterpiece</label>
            </div>
            {usedPrompt && (
              <div className="prompt-used-box">
                <p><strong>Prompt:</strong> {usedPrompt}</p>
              </div>
            )}
            <div className="image-container main-image-container">
              <img src={imageUrl} alt="Generated" className="generated-image" />
              <div className="image-hover-overlay">
                <button className="btn secondary" onClick={() => setFullScreenImage(imageUrl)}>
                  🔍 Open Full
                </button>
              </div>
            </div>
            <div className="result-actions">
              <button className="btn secondary flex-1" onClick={downloadMain}>
                💾 Download
              </button>
              <button className="btn secondary flex-1" onClick={() => setFullScreenImage(imageUrl)}>
                🖼️ Open Full
              </button>
            </div>
          </div>
        )}
      </main>

      <section className="history-section">
        <div className="history-header">
          <h2 className="history-title">Your Gallery</h2>
          <span className="history-count">{history.length} items</span>
        </div>
        {history.length === 0
          ? <div className="empty-history-card">
              <span className="empty-icon">🎨</span>
              <p>Your creative journey starts here.</p>
            </div>
          : <div className="history-grid">
              {history.map((item) => (
                <HistoryCard 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDelete} 
                  onOpenFull={setFullScreenImage}
                />
              ))}
            </div>
        }
      </section>

      {/* Full Screen Modal */}
      {fullScreenImage && (
        <div className="modal-overlay" onClick={() => setFullScreenImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setFullScreenImage(null)}>×</button>
            <img src={fullScreenImage} alt="Full Screen" className="full-screen-img" />
          </div>
        </div>
      )}

      <PWABadge />
    </div>
  );
}

export default App;

