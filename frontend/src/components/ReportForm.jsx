import { useState } from 'react';
import { generateReport } from '../api';

export default function ReportForm({ originalFile }) {
  const [showForm, setShowForm] = useState(false);
  const [coilId, setCoilId] = useState('');
  const [operatorName, setOperatorName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!originalFile) return;

    setGenerating(true);
    setError(null);

    try {
      const blob = await generateReport(
        originalFile,
        coilId || 'N/A',
        operatorName || 'N/A',
        batchNo || 'N/A',
      );

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${coilId || 'inspection'}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setShowForm(false);
      setCoilId('');
      setOperatorName('');
      setBatchNo('');
    } catch (err) {
      setError('Report generation failed. Check backend connection.');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="panel" id="report-section">
      {!showForm ? (
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ width: '100%' }}
          id="btn-generate-report"
        >
          Generate Report
        </button>
      ) : (
        <form className="report-form" onSubmit={handleSubmit}>
          <span className="section-label">INSPECTION REPORT</span>

          <label htmlFor="coil-id">Coil ID</label>
          <input
            type="text"
            id="coil-id"
            value={coilId}
            onChange={(e) => setCoilId(e.target.value)}
            placeholder="e.g. C-2024-0451"
          />

          <label htmlFor="operator-name">Operator Name</label>
          <input
            type="text"
            id="operator-name"
            value={operatorName}
            onChange={(e) => setOperatorName(e.target.value)}
            placeholder="e.g. Rajesh Kumar"
          />

          <label htmlFor="batch-no">Batch No.</label>
          <input
            type="text"
            id="batch-no"
            value={batchNo}
            onChange={(e) => setBatchNo(e.target.value)}
            placeholder="e.g. B-2024-078"
          />

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              type="submit"
              className={`btn btn-primary ${generating ? 'pulse-animation' : ''}`}
              disabled={generating}
              id="btn-submit-report"
              style={{ flex: 1 }}
            >
              {generating ? 'Generating Report...' : 'Download PDF'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setShowForm(false)}
              disabled={generating}
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="error-panel" style={{ marginTop: '8px' }}>
              <p className="error-text">{error}</p>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
