import { useState, useRef, useCallback } from 'react';

export default function UploadPanel({
  onAnalyse,
  onBatchAnalyse,
  loading,
  onClear,
}) {
  const [batchMode, setBatchMode] = useState(false);
  const [explainability, setExplainability] = useState(false);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback((fileList) => {
    const arr = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (arr.length > 0) setFiles(arr);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      handleFiles(e.target.files);
    },
    [handleFiles],
  );

  const handleAnalyse = () => {
    if (files.length === 0) return;
    if (batchMode && files.length > 1) {
      onBatchAnalyse(files);
    } else {
      onAnalyse(files[0], explainability);
    }
  };

  const handleClear = () => {
    setFiles([]);
    if (inputRef.current) inputRef.current.value = '';
    onClear();
  };

  return (
    <div className="panel panel-accent upload-panel" id="upload-panel">
      <div className="upload-header">
        <span className="section-label">
          IMAGE UPLOAD&nbsp;&nbsp;—&nbsp;&nbsp;{batchMode ? 'BATCH' : 'SINGLE'}
        </span>
        <div className="toggle-group">
          <button
            className={`toggle-btn ${!batchMode ? 'active' : ''}`}
            onClick={() => setBatchMode(false)}
            id="toggle-single"
          >
            Single
          </button>
          <button
            className={`toggle-btn ${batchMode ? 'active' : ''}`}
            onClick={() => setBatchMode(true)}
            id="toggle-batch"
          >
            Batch
          </button>
        </div>
      </div>

      {/* Drop zone */}
      <div
        className={`dropzone ${dragOver ? 'drag-over' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        id="dropzone"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={batchMode}
          onChange={handleInputChange}
          style={{ display: 'none' }}
          id="file-input"
        />

        {files.length === 0 ? (
          <p className="dropzone-text">
            Drop {batchMode ? 'images' : 'an image'} here or click to browse
          </p>
        ) : (
          <div>
            <p className="dropzone-text">
              {files.length} {files.length === 1 ? 'FILE' : 'FILES'} SELECTED
            </p>
            {files.map((f, i) => (
              <p key={i} className="dropzone-filename">
                {f.name.length > 40 ? f.name.slice(0, 37) + '...' : f.name}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="upload-controls">
        <label className="checkbox-container" id="explainability-toggle">
          <input
            type="checkbox"
            checked={explainability}
            onChange={(e) => setExplainability(e.target.checked)}
          />
          <span className="checkbox-label">Explainability (Grad-CAM)</span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="upload-actions">
        <button
          className="btn btn-primary"
          onClick={handleAnalyse}
          disabled={files.length === 0 || loading}
          id="btn-analyse"
        >
          {loading ? 'Analysing...' : 'Analyse'}
        </button>
        <button
          className="btn btn-ghost"
          onClick={handleClear}
          disabled={loading}
          id="btn-clear"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
