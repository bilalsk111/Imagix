import { FaPalette } from 'react-icons/fa';
import HistoryCard from './HistoryCard.jsx';

const GalleryVault = ({ history, onDelete, onOpenFull }) => {
  return (
    <section className="gallery-layout">
      <div className="gallery-header">
        <h2>Your Gallery</h2>
        <span className="vault-badge">{history.length} {history.length === 1 ? 'image' : 'images'}</span>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <FaPalette className="empty-icon" aria-hidden="true" />
          <p>Your creative journey starts here. Generate your first image above.</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {history.map((item, index) => (
            <HistoryCard key={item.id} item={item} index={index} onDelete={onDelete} onOpenFull={onOpenFull} />
          ))}
        </div>
      )}
    </section>
  );
};

export default GalleryVault;