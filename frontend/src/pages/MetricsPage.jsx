import { useState, useEffect } from 'react';
import { fetchMetrics } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMetrics();
        setMetrics(data);
      } catch (err) {
        setError(err.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className="loading-bar-container">
          <div className="loading-bar" />
        </div>
        <p className="loading-label">LOADING MODEL METRICS</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-panel">
        <p className="error-text">FAILED TO LOAD METRICS — {error}</p>
      </div>
    );
  }

  if (!metrics) return null;

  // Prepare per-class data for chart
  const perClassData = Object.entries(metrics.per_class_ap).map(([name, ap]) => ({
    name,
    ap: parseFloat((ap * 100).toFixed(1)),
  }));

  const latencyDisplay = metrics.live_avg_inference_ms > 0
    ? metrics.live_avg_inference_ms
    : metrics.avg_inference_ms_cpu;

  return (
    <div id="metrics-page">
      <div className="panel-header" style={{ marginBottom: '16px' }}>
        <span className="section-label">MODEL PERFORMANCE METRICS</span>
      </div>

      {/* Stat cards */}
      <div className="metrics-grid">
        <div className="stat-card" id="stat-map50">
          <div className="stat-value">{(metrics.map50 * 100).toFixed(1)}%</div>
          <div className="stat-label">mAP@50</div>
        </div>
        <div className="stat-card" id="stat-precision">
          <div className="stat-value">{(metrics.precision * 100).toFixed(1)}%</div>
          <div className="stat-label">Precision</div>
        </div>
        <div className="stat-card" id="stat-recall">
          <div className="stat-value">{(metrics.recall * 100).toFixed(1)}%</div>
          <div className="stat-label">Recall</div>
        </div>
        <div className="stat-card" id="stat-latency">
          <div className="stat-value">{latencyDisplay}<span style={{ fontSize: '14px' }}>ms</span></div>
          <div className="stat-label">Avg Latency</div>
        </div>
      </div>

      {/* Per-class AP bar chart */}
      <div className="panel metrics-chart" id="per-class-chart">
        <div className="panel-header">
          <span className="section-label">PER-CLASS AVERAGE PRECISION</span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={perClassData}
            layout="vertical"
            margin={{ top: 8, right: 30, left: 80, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fill: '#6B7280' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, fill: '#374151' }}
              width={80}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, 'AP']}
              contentStyle={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                border: '1px solid #E5E7EB',
                borderRadius: 4,
              }}
            />
            <Bar dataKey="ap" radius={[0, 2, 2, 0]} barSize={20}>
              {perClassData.map((entry, idx) => (
                <Cell key={idx} fill="#003087" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Model card */}
      <div className="panel" id="model-card">
        <div className="panel-header">
          <span className="section-label">MODEL CARD</span>
        </div>
        <table className="model-card-table">
          <tbody>
            <tr>
              <td>Model Name</td>
              <td>{metrics.model_name}</td>
            </tr>
            <tr>
              <td>Architecture</td>
              <td>{metrics.architecture}</td>
            </tr>
            <tr>
              <td>Training Dataset</td>
              <td>{metrics.training_dataset}</td>
            </tr>
            <tr>
              <td>Epochs</td>
              <td>{metrics.total_epochs}</td>
            </tr>
            <tr>
              <td>Image Size</td>
              <td>{metrics.image_size}px</td>
            </tr>
            <tr>
              <td>Device</td>
              <td>{metrics.device}</td>
            </tr>
            <tr>
              <td>Model Size</td>
              <td>{metrics.model_size_mb} MB</td>
            </tr>
            <tr>
              <td>mAP@50-95</td>
              <td>{(metrics.map50_95 * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
