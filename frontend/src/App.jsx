import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import PWABadge from './PWABadge.jsx';
import { saveImage, getImages, deleteImage } from './db.js';
import './App.css';
import PromptInput from './components/PromptInput.jsx';
import ImageShowcase from './components/ImageShowcase.jsx';
import GalleryVault from './components/GalleryVault.jsx';
import Lightbox from './components/Lightbox.jsx';

function App() {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle'); // idle | generating | done | error
  const [imageUrl, setImageUrl] = useState('');
  const [usedPrompt, setUsedPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const loadHistory = useCallback(async () => {
    try { setHistory(await getImages()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setErrorMsg('');
    setImageUrl('');
    setUsedPrompt('');
    setStatus('generating');

    try {
      const { data } = await axios.post('/api/image/generate', {
        prompt: prompt.trim(),
        enhancePrompt: false,
      });

      if (!data.success) throw new Error(data.message || 'Server error');

      const { image, usedPrompt: up } = data.data;
      setImageUrl(image);
      setUsedPrompt(up);
      setStatus('done');

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

  const isLoading = status === 'generating';

  return (
    <div className="app-container">
      <div className="ambient-glow dynamic-purple" aria-hidden="true" />
      <div className="ambient-glow dynamic-blue" aria-hidden="true" />

      <header className="header">
        <h1 className="title">Imagix AI</h1>
        <p className="subtitle">Craft stunning visuals with Midjourney-style enhancement.</p>
      </header>

      <main className="main-card glass-effect">
        {status === 'error' && errorMsg && (
          <div className="error-banner">
            <span className="error-text">{errorMsg}</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={generate}>
              Retry
            </button>
          </div>
        )}

        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={generate}
          isGenerating={status === 'generating'}
          disabled={isLoading}
        />

        <ImageShowcase
          imageUrl={imageUrl}
          usedPrompt={usedPrompt}
          onOpenFull={setFullScreenImage}
          onDownload={downloadMain}
        />
      </main>

      <GalleryVault
        history={history}
        onDelete={handleDelete}
        onOpenFull={setFullScreenImage}
      />

      <Lightbox image={fullScreenImage} onClose={() => setFullScreenImage(null)} />

      <PWABadge />
    </div>
  );
}

export default App;
