import { useState } from 'react';
import VerdictBanner from './VerdictBanner';
import DetectionSummary from './DetectionSummary';
import ImageViewer from './ImageViewer';

export default function BatchResults({ batchData }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  if (!batchData) return null;

  const { results, batch_summary } = batchData;

  const closeDrawer = () => setSelectedIdx(null);
  const selected = selectedIdx !== null ? results[selectedIdx] : null;

  return (
    <div id="batch-results">
      <div className="panel-header">
        <span className="section-label">BATCH INSPECTION RESULTS</span>
      </div>

      {/* Summary strip */}
      <div className="batch-summary-strip">
        <div className="batch-chip">
          <div className="batch-chip-value">{batch_summary.total}</div>
          <div className="batch-chip-label">Total</div>
        </div>
        <div className="batch-chip" style={{ borderLeft: '3px solid var(--verdict-pass)' }}>
          <div className="batch-chip-value" style={{ color: 'var(--verdict-pass)' }}>
            {batch_summary.pass}
          </div>
          <div className="batch-chip-label">Pass</div>
        </div>
        <div className="batch-chip" style={{ borderLeft: '3px solid var(--verdict-marginal)' }}>
          <div className="batch-chip-value" style={{ color: 'var(--verdict-marginal)' }}>
            {batch_summary.marginal}
          </div>
          <div className="batch-chip-label">Marginal</div>
        </div>
        <div className="batch-chip" style={{ borderLeft: '3px solid var(--verdict-reject)' }}>
          <div className="batch-chip-value" style={{ color: 'var(--verdict-reject)' }}>
            {batch_summary.reject}
          </div>
          <div className="batch-chip-label">Reject</div>
        </div>
      </div>

      {/* Card grid */}
      <div className="batch-grid">
        {results.map((r, i) => {
          const badgeClass =
            r.verdict === 'PASS'
              ? 'badge-pass'
              : r.verdict === 'MARGINAL'
                ? 'badge-marginal'
                : 'badge-reject';

          const truncName =
            r.filename.length > 20
              ? r.filename.slice(0, 17) + '...'
              : r.filename;

          return (
            <div
              key={i}
              className="batch-card"
              onClick={() => setSelectedIdx(i)}
              id={`batch-card-${i}`}
            >
              <img
                src={`data:image/jpeg;base64,${r.image}`}
                alt={r.filename}
                className="batch-card-thumb"
              />
              <div className="batch-card-info">
                <span className="batch-card-filename">{truncName}</span>
                <span className={`badge ${badgeClass}`}>{r.verdict}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span className="batch-card-defects">
                  {r.defect_count} defect{r.defect_count !== 1 ? 's' : ''} · {r.inference_ms}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <>
          <div className="batch-detail-backdrop" onClick={closeDrawer} />
          <div className="batch-detail-overlay" id="batch-detail-drawer">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>
                {selected.filename}
              </span>
              <button className="btn btn-ghost" onClick={closeDrawer} style={{ height: '28px', padding: '0 10px' }}>
                ✕
              </button>
            </div>

            <VerdictBanner
              verdict={selected.verdict}
              verdictScore={selected.verdict_score}
            />

            <ImageViewer
              imageBase64={selected.image}
              detections={selected.detections}
            />

            <div style={{ marginTop: '12px' }}>
              <DetectionSummary
                detections={selected.detections}
                inferenceMs={selected.inference_ms}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
