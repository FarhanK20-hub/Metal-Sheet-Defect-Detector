import { useState } from 'react';
import HeatmapCanvas from './HeatmapCanvas';
import GradCamViewer from './GradCamViewer';

export default function ImageViewer({ imageBase64, detections, gradcamBase64 }) {
  const [view, setView] = useState('annotated');

  if (!imageBase64) return null;

  const hasGradcam = !!gradcamBase64;
  const hasDetections = detections && detections.length > 0;

  return (
    <div className="panel" id="image-viewer">
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="section-label" style={{ marginBottom: 0 }}>ANNOTATED OUTPUT</span>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${view === 'annotated' ? 'active' : ''}`}
            onClick={() => setView('annotated')}
            id="view-annotated"
          >
            Annotated
          </button>
          {hasDetections && (
            <button
              className={`toggle-btn ${view === 'heatmap' ? 'active' : ''}`}
              onClick={() => setView('heatmap')}
              id="view-heatmap"
            >
              Heatmap
            </button>
          )}
          {hasGradcam && (
            <button
              className={`toggle-btn ${view === 'gradcam' ? 'active' : ''}`}
              onClick={() => setView('gradcam')}
              id="view-gradcam"
            >
              Grad-CAM
            </button>
          )}
        </div>
      </div>

      <div className="image-viewer">
        {view === 'annotated' && (
          <img
            src={`data:image/jpeg;base64,${imageBase64}`}
            alt="Annotated detection result"
            id="result-image"
          />
        )}

        {view === 'heatmap' && (
          <HeatmapCanvas
            imageBase64={imageBase64}
            detections={detections}
          />
        )}

        {view === 'gradcam' && hasGradcam && (
          <GradCamViewer gradcamBase64={gradcamBase64} />
        )}
      </div>
    </div>
  );
}
