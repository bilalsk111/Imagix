import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaMagic } from 'react-icons/fa';

const GenerateForm = () => {
 const [prompt, setPrompt] = useState('');
  const [shouldEnhance, setShouldEnhance] = useState(true);
  const [status, setStatus] = useState('idle'); // idle | enhancing | generating | done | error
  const [imageUrl, setImageUrl] = useState('');
  const [usedPrompt, setUsedPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState('');


  const generate = async () => {
    if (!prompt.trim()) return;
    setErrorMsg('');
    setImageUrl('');
    setUsedPrompt('');
    setStatus(shouldEnhance ? 'enhancing' : 'generating');

    try {
      const { data } = await axios.post('/api/image/generate', {
        prompt: prompt.trim(),
        enhancePrompt: shouldEnhance,
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

    const isLoading = status === 'enhancing' || status === 'generating';
  return (
         <main className="card">
        {status === 'error' && errorMsg && (
          <div className="error-message" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <span>{errorMsg}</span>
            <button className="btn" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }} onClick={generate}>
              Retry
            </button>
          </div>
        )}

        <div className="input-group">
          <label htmlFor="prompt-input">Describe your idea</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A futuristic city with flying cars at sunset..."
            disabled={isLoading}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey && !isLoading && prompt.trim()) generate(); }}
          />

          <label className="enhance-toggle" htmlFor="enhance-checkbox">
            <input
              id="enhance-checkbox"
              type="checkbox"
              checked={shouldEnhance}
              onChange={(e) => setShouldEnhance(e.target.checked)}
              disabled={isLoading}
            />
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMagic /> Enhance with AI (Midjourney Style)</span>
          </label>

          <button
            className="btn"
            onClick={generate}
            disabled={isLoading || !prompt.trim()}
            style={{ background: 'linear-gradient(to right, #8b5cf6, #38bdf8)', marginTop: '0.5rem' }}
          >
            {isLoading
              ? <><div className="loader" />{status === 'enhancing' ? 'Enhancing Prompt...' : 'Generating Image...'}</>
              : 'Create Masterpiece'}
          </button>
        </div>

        {imageUrl && (
          <div className="input-group" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <label>Your Masterpiece</label>
            {usedPrompt && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                <strong>Prompt used:</strong> {usedPrompt}
              </p>
            )}
            <div className="image-container">
              <img src={imageUrl} alt="Generated" className="generated-image" />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn" style={{ flex: 1 }} onClick={downloadMain}>
                Download
              </button>
            </div>
          </div>
        )}
      </main>
  )
}

export default GenerateForm