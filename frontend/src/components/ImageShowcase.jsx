import { FaSearchPlus, FaDownload } from 'react-icons/fa';

const ImageShowcase = ({ imageUrl, usedPrompt, onOpenFull, onDownload }) => {
  if (!imageUrl) return null;

  return (
    <div className="showcase-block">
      <div className="showcase-header">
        <h3>Your Masterpiece</h3>
      </div>

      {usedPrompt && (
        <div className="prompt-meta-box">
          <strong>Prompt used:</strong> {usedPrompt}
        </div>
      )}

      <div className="showcase-frame">
        <img src={imageUrl} alt={usedPrompt || 'Generated artwork'} className="showcase-image" />
        <div className="frame-overlay">
          <button type="button" className="btn btn-glass btn-sm" onClick={() => onOpenFull(imageUrl)}>
            <FaSearchPlus /> View Fullscreen
          </button>
        </div>
      </div>

      <div className="showcase-actions">
        <button type="button" className="btn btn-secondary" onClick={onDownload}>
          <FaDownload /> Download Image
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => onOpenFull(imageUrl)}>
          <FaSearchPlus /> View Fullscreen
        </button>
      </div>
    </div>
  );
};

export default ImageShowcase;