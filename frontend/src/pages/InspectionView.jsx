import { useState } from 'react';
import UploadPanel from '../components/UploadPanel';
import ResultsPanel from '../components/ResultsPanel';
import BatchResults from '../components/BatchResults';
import { predictImage, batchPredict } from '../api';

export default function InspectionView() {
  const [result, setResult] = useState(null);
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('single'); // 'single' | 'batch'
  const [originalFile, setOriginalFile] = useState(null);

  const handleAnalyse = async (file, explainability) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBatchData(null);
    setMode('single');
    setOriginalFile(file);

    try {
      const data = await predictImage(file, explainability);
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchAnalyse = async (files) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setBatchData(null);
    setMode('batch');
    setOriginalFile(null);

    try {
      const data = await batchPredict(files);
      setBatchData(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    setBatchData(null);
    setError(null);
    setOriginalFile(null);
  };

  return (
    <div>
      <UploadPanel
        onAnalyse={handleAnalyse}
        onBatchAnalyse={handleBatchAnalyse}
        loading={loading}
        onClear={handleClear}
      />

      {/* Single result */}
      {mode === 'single' && (
        <ResultsPanel
          result={result}
          loading={loading}
          error={error}
          originalFile={originalFile}
        />
      )}

      {/* Batch result */}
      {mode === 'batch' && !loading && !error && batchData && (
        <BatchResults batchData={batchData} />
      )}

      {/* Batch loading */}
      {mode === 'batch' && loading && (
        <div className="panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="loading-bar-container">
            <div className="loading-bar" />
          </div>
          <p className="loading-label">
            PROCESSING BATCH&nbsp;&nbsp;·&nbsp;&nbsp;PLEASE WAIT
          </p>
        </div>
      )}

      {/* Batch error */}
      {mode === 'batch' && !loading && error && (
        <div className="error-panel">
          <p className="error-text">
            BATCH INFERENCE FAILED — CHECK BACKEND CONNECTION
          </p>
          <p className="mono-data" style={{ fontSize: '11px', color: 'var(--steel-gray)', marginTop: '4px' }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
