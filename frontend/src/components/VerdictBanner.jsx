export default function VerdictBanner({ verdict, verdictScore }) {
  if (!verdict) return null;

  const config = {
    PASS: {
      className: 'verdict-pass',
      message: 'PASS — COIL APPROVED FOR DISPATCH',
    },
    MARGINAL: {
      className: 'verdict-marginal',
      message: 'MARGINAL — REQUIRES SECONDARY INSPECTION',
    },
    REJECT: {
      className: 'verdict-reject',
      message: 'REJECT — COIL FLAGGED FOR REMOVAL',
    },
  };

  const { className, message } = config[verdict] || config.REJECT;

  // Quality bar color
  const barColor =
    verdictScore >= 70
      ? 'var(--verdict-pass)'
      : verdictScore >= 40
        ? 'var(--verdict-marginal)'
        : 'var(--verdict-reject)';

  return (
    <div id="verdict-banner">
      {/* Verdict banner */}
      <div className={`verdict-banner ${className}`}>
        <p className="verdict-text">{message}</p>
      </div>

      {/* Quality score bar */}
      <div className="panel" style={{ padding: '12px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
          }}
        >
          <span className="section-label" style={{ marginBottom: 0 }}>
            QUALITY INDEX
          </span>
          <span className="mono-data" style={{ fontWeight: 500 }}>
            {String(verdictScore).padStart(2, '0')} / 100
          </span>
        </div>
        <div className="quality-bar-track">
          <div
            className="quality-bar-fill"
            style={{
              width: `${verdictScore}%`,
              background: barColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}
