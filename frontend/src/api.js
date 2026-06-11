import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 120000,
});

/**
 * Single image prediction.
 * @param {File} file - Image file to analyse
 * @param {boolean} explainability - Whether to request Grad-CAM overlay
 * @returns {Promise<object>} JSON response with base64 image + detections
 */
export async function predictImage(file, explainability = false) {
  const formData = new FormData();
  formData.append('image', file);

  const params = explainability ? '?explainability=true' : '';
  const response = await api.post(`/predict${params}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Batch image prediction.
 * @param {File[]} files - Array of image files
 * @returns {Promise<object>} JSON with results array + batch_summary
 */
export async function batchPredict(files) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Generate inspection report PDF.
 * @param {File} file - Original image file
 * @param {string} coilId
 * @param {string} operatorName
 * @param {string} batchNo
 * @returns {Promise<Blob>} PDF blob for download
 */
export async function generateReport(file, coilId, operatorName, batchNo) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('coil_id', coilId);
  formData.append('operator_name', operatorName);
  formData.append('batch_no', batchNo);

  const response = await api.post('/report', formData, {
    responseType: 'blob',
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

/**
 * Fetch model metrics.
 * @returns {Promise<object>} Metrics JSON
 */
export async function fetchMetrics() {
  const response = await api.get('/metrics');
  return response.data;
}

export default api;
