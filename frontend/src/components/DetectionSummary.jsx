export default function DetectionSummary({ detections, inferenceMs }) {
  if (!detections) return null;

  // Aggregate by class
  const classMap = {};
  detections.forEach((d) => {
    if (!classMap[d.class]) {
      classMap[d.class] = { count: 0, totalConf: 0 };
    }
    classMap[d.class].count += 1;
    classMap[d.class].totalConf += d.confidence;
  });

  const classes = Object.entries(classMap).map(([name, stats]) => ({
    name,
    count: stats.count,
    avgConf: stats.totalConf / stats.count,
  }));

  const totalDefects = detections.length;

  return (
    <div className="panel panel-accent" id="detection-summary">
      <div className="panel-header">
        <span className="section-label">DETECTION SUMMARY</span>
      </div>

      {/* Per-class rows */}
      {classes.length > 0 ? (
        classes.map((cls) => (
          <div className="detection-row" key={cls.name}>
            <span className="detection-class-name">{cls.name}</span>
            <span className="detection-count">{cls.count}</span>
            <div className="confidence-bar-track">
              <div
                className="confidence-bar-fill"
                style={{ width: `${(cls.avgConf * 100).toFixed(0)}%` }}
              />
            </div>
            <span className="mono-data" style={{ fontSize: '11px', minWidth: '44px', textAlign: 'right' }}>
              {(cls.avgConf * 100).toFixed(1)}%
            </span>
          </div>
        ))
      ) : (
        <p className="mono-data" style={{ color: 'var(--steel-gray)', padding: '8px 0' }}>
          No defects detected
        </p>
      )}

      {/* Total */}
      <div className="detection-total">
        <span className="detection-total-number">
          {String(totalDefects).padStart(2, '0')}
        </span>
        <span className="detection-total-label">
          {totalDefects === 1 ? 'DEFECT DETECTED' : 'DEFECTS DETECTED'}
        </span>
      </div>

      {/* Inference time */}
      {inferenceMs != null && (
        <div style={{ marginTop: '8px' }}>
          <span className="mono-data" style={{ fontSize: '12px', color: 'var(--steel-gray)' }}>
            Inference: {inferenceMs} ms
          </span>
        </div>
      )}
    </div>
  );
}
