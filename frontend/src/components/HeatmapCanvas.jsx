import { useRef, useEffect, useState } from 'react';

export default function HeatmapCanvas({ imageBase64, detections }) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !detections || detections.length === 0) return;

    const draw = () => {
      const displayW = img.clientWidth;
      const displayH = img.clientHeight;
      const natW = img.naturalWidth;
      const natH = img.naturalHeight;

      canvas.width = displayW;
      canvas.height = displayH;
      setImgSize({ w: displayW, h: displayH });

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, displayW, displayH);
      ctx.globalCompositeOperation = 'screen';

      const scaleX = displayW / natW;
      const scaleY = displayH / natH;

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox;
        const cx = ((x1 + x2) / 2) * scaleX;
        const cy = ((y1 + y2) / 2) * scaleY;
        const boxW = (x2 - x1) * scaleX;
        const boxH = (y2 - y1) * scaleY;
        const radius = Math.max(boxW, boxH) * 0.8;

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
      });
    };

    if (img.complete) {
      draw();
    } else {
      img.onload = draw;
    }

    // Redraw on resize
    const resizeObserver = new ResizeObserver(draw);
    resizeObserver.observe(img);

    return () => resizeObserver.disconnect();
  }, [imageBase64, detections]);

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <img
          ref={imgRef}
          src={`data:image/jpeg;base64,${imageBase64}`}
          alt="Heatmap base"
          style={{ width: '100%', display: 'block', borderRadius: '2px' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Legend */}
      <div className="heatmap-legend">
        <span className="heatmap-legend-text">Low Density</span>
        <div className="heatmap-legend-bar" />
        <span className="heatmap-legend-text">High Density</span>
      </div>
    </div>
  );
}
