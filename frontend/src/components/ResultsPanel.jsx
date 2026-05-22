import VerdictBanner from './VerdictBanner';
import DetectionSummary from './DetectionSummary';
import ImageViewer from './ImageViewer';
import ReportForm from './ReportForm';

export default function ResultsPanel({ result, loading, error, originalFile }) {
  /* Loading state */
  if (loading) {
    return (
      <div className="panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className="loading-bar-container">
          <div className="loading-bar" />
        </div>
        <p className="loading-label">
          RUNNING INFERENCE&nbsp;&nbsp;·&nbsp;&nbsp;PLEASE WAIT
        </p>
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="error-panel">
        <p className="error-text">
          INFERENCE FAILED — CHECK BACKEND CONNECTION
        </p>
        <p className="mono-data" style={{ fontSize: '11px', color: 'var(--steel-gray)', marginTop: '4px' }}>
          {error}
        </p>
      </div>
    );
  }

  /* No result yet */
  if (!result) return null;

  return (
    <div id="results-panel">
      <div className="panel-header">
        <span className="section-label">INSPECTION RESULTS</span>
      </div>

      {/* Verdict Banner — full width */}
      <VerdictBanner
        verdict={result.verdict}
        verdictScore={result.verdict_score}
      />

      {/* Split layout */}
      <div className="results-grid">
        {/* Left — Image viewer */}
        <div className="results-left">
          <ImageViewer
            imageBase64={result.image}
            detections={result.detections}
            gradcamBase64={result.gradcam_image}
          />
        </div>

        {/* Right — Summary + Report */}
        <div className="results-right">
          <DetectionSummary
            detections={result.detections}
            inferenceMs={result.inference_ms}
          />

          <ReportForm originalFile={originalFile} />
        </div>
      </div>
    </div>
  );
}
