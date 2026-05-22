export default function GradCamViewer({ gradcamBase64 }) {
  if (!gradcamBase64) return null;

  return (
    <div>
      <img
        src={`data:image/jpeg;base64,${gradcamBase64}`}
        alt="Grad-CAM attention overlay"
        style={{ width: '100%', display: 'block', borderRadius: '2px' }}
        id="gradcam-image"
      />

      <div className="gradcam-label">
        <span>MODEL ATTENTION MAP — regions driving the detection decision</span>
        <span className="tooltip-wrapper">
          <span className="tooltip-icon">?</span>
          <span className="tooltip-content">
            Grad-CAM highlights which regions of the image most influenced the
            model's prediction. Brighter areas received more attention during
            inference.
          </span>
        </span>
      </div>
    </div>
  );
}
