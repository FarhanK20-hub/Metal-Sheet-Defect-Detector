import time
import base64
import json
from io import BytesIO
from collections import deque
from datetime import datetime

import cv2
import numpy as np
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Model loading
# ---------------------------------------------------------------------------
model = YOLO("my_model.pt")

# ---------------------------------------------------------------------------
# Rolling inference tracker (last 10)
# ---------------------------------------------------------------------------
inference_times = deque(maxlen=10)

# ---------------------------------------------------------------------------
# Class-specific color palette (cycle for bounding boxes)
# ---------------------------------------------------------------------------
CLASS_COLORS = [
    (14, 165, 233),   # #0EA5E9 — sky blue
    (245, 158, 11),   # #F59E0B — amber
    (239, 68, 68),    # #EF4444 — red
    (16, 185, 129),   # #10B981 — emerald
    (139, 92, 246),   # #8B5CF6 — violet
]

# ---------------------------------------------------------------------------
# Verdict computation
# ---------------------------------------------------------------------------
def compute_verdict(detections):
    """Compute pass / marginal / reject verdict from detection list."""
    defect_count = len(detections)
    confidences = [d["confidence"] for d in detections]
    distinct_classes = set(d["class"] for d in detections)

    # REJECT conditions
    if defect_count >= 4:
        verdict = "REJECT"
    elif any(c >= 0.90 for c in confidences):
        verdict = "REJECT"
    elif len(distinct_classes) > 2:
        verdict = "REJECT"
    # MARGINAL conditions
    elif defect_count in (2, 3):
        verdict = "MARGINAL"
    elif any(0.75 <= c < 0.90 for c in confidences):
        verdict = "MARGINAL"
    # PASS
    else:
        verdict = "PASS"

    # Quality score: 100 = perfectly clean
    if defect_count == 0:
        verdict_score = 100
    else:
        avg_conf = sum(confidences) / len(confidences)
        verdict_score = max(0, int(100 - (defect_count * 15) - (avg_conf * 30)))

    return verdict, verdict_score


# ---------------------------------------------------------------------------
# Custom annotation drawing
# ---------------------------------------------------------------------------
def annotate_image(pil_image, detections):
    """Draw bounding boxes and label pills on the image."""
    draw = ImageDraw.Draw(pil_image)
    img_w, img_h = pil_image.size

    # Font size proportional to image width
    font_size = max(12, int(img_w * 0.022))
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except (IOError, OSError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        except (IOError, OSError):
            font = ImageFont.load_default()

    for det in detections:
        cls_name = det["class"]
        conf = det["confidence"]
        x1, y1, x2, y2 = det["bbox"]
        cls_idx = det.get("class_index", 0)
        color_rgb = CLASS_COLORS[cls_idx % len(CLASS_COLORS)]

        # Draw bounding box
        draw.rectangle([x1, y1, x2, y2], outline=color_rgb, width=2)

        # Label text
        label = f"{cls_name}  {conf:.2f}"
        bbox_text = draw.textbbox((0, 0), label, font=font)
        text_w = bbox_text[2] - bbox_text[0]
        text_h = bbox_text[3] - bbox_text[1]

        pill_padding = 4
        pill_x1 = x1
        pill_y1 = max(0, y1 - text_h - pill_padding * 2)
        pill_x2 = x1 + text_w + pill_padding * 2
        pill_y2 = y1

        # Draw filled label pill
        draw.rectangle([pill_x1, pill_y1, pill_x2, pill_y2], fill=color_rgb)
        draw.text(
            (pill_x1 + pill_padding, pill_y1 + pill_padding - 2),
            label,
            fill=(255, 255, 255),
            font=font,
        )

    return pil_image


# ---------------------------------------------------------------------------
# Run inference helper
# ---------------------------------------------------------------------------
def run_inference(pil_image, explainability=False):
    """Run YOLOv8 inference and return (annotated_pil, detections, inference_ms, gradcam_b64)."""
    start = time.time()
    results = model.predict(pil_image, device="cpu")
    elapsed_ms = int((time.time() - start) * 1000)
    inference_times.append(elapsed_ms)

    result = results[0]
    detections = []

    if result.boxes is not None and len(result.boxes) > 0:
        for box in result.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls_idx = int(box.cls[0])
            cls_name = model.names.get(cls_idx, f"Class_{cls_idx}")

            detections.append({
                "class": cls_name,
                "confidence": round(conf, 4),
                "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                "class_index": cls_idx,
            })

    # Annotate image
    annotated = pil_image.copy()
    annotated = annotate_image(annotated, detections)

    # Grad-CAM (optional, best-effort)
    gradcam_b64 = None
    if explainability:
        gradcam_b64 = generate_gradcam(pil_image)

    return annotated, detections, elapsed_ms, gradcam_b64


# ---------------------------------------------------------------------------
# Grad-CAM generation (best-effort)
# ---------------------------------------------------------------------------
def generate_gradcam(pil_image):
    """Generate Grad-CAM++ heatmap overlay. Returns base64 string or None."""
    try:
        from pytorch_grad_cam import GradCAMPlusPlus
        from pytorch_grad_cam.utils.image import preprocess_image
        from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
        import torch

        # Get the backbone model
        backbone = model.model.model
        # Find the last convolutional layer
        target_layer = None
        for module in reversed(list(backbone.modules())):
            if isinstance(module, torch.nn.Conv2d):
                target_layer = module
                break

        if target_layer is None:
            return None

        # Prepare image
        img_np = np.array(pil_image)
        img_resized = cv2.resize(img_np, (640, 640))
        input_tensor = preprocess_image(
            img_resized,
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        )

        # Wrap model for classification-style output
        class YOLOWrapper(torch.nn.Module):
            def __init__(self, yolo_model):
                super().__init__()
                self.model = yolo_model.model.model

            def forward(self, x):
                features = x
                for i, layer in enumerate(self.model):
                    features = layer(features)
                    if layer is target_layer:
                        break
                return features.mean(dim=[2, 3])

        wrapper = YOLOWrapper(model)
        wrapper.eval()

        cam = GradCAMPlusPlus(model=wrapper, target_layers=[target_layer])
        grayscale_cam = cam(input_tensor=input_tensor, targets=None)
        grayscale_cam = grayscale_cam[0, :]

        # Resize cam to original image dimensions
        cam_resized = cv2.resize(grayscale_cam, (img_np.shape[1], img_np.shape[0]))
        cam_uint8 = np.uint8(255 * cam_resized)
        cam_colored = cv2.applyColorMap(cam_uint8, cv2.COLORMAP_JET)
        cam_colored = cv2.cvtColor(cam_colored, cv2.COLOR_BGR2RGB)

        # Blend
        blended = cv2.addWeighted(img_np, 0.5, cam_colored, 0.5, 0)
        blended_pil = Image.fromarray(blended)

        buf = BytesIO()
        blended_pil.save(buf, format="JPEG", quality=90)
        return base64.b64encode(buf.getvalue()).decode("utf-8")

    except Exception as e:
        print(f"[WARN] Grad-CAM generation failed: {e}")
        return None


# ---------------------------------------------------------------------------
# Image to base64 helper
# ---------------------------------------------------------------------------
def pil_to_base64(pil_image, fmt="JPEG", quality=90):
    buf = BytesIO()
    pil_image.save(buf, format=fmt, quality=quality)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


# ---------------------------------------------------------------------------
# /predict — Single image inference
# ---------------------------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        pil_image = Image.open(file.stream).convert("RGB")

        explainability = request.args.get("explainability", "false").lower() == "true"

        annotated, detections, elapsed_ms, gradcam_b64 = run_inference(
            pil_image, explainability=explainability
        )

        verdict, verdict_score = compute_verdict(detections)

        # Build class summary
        classes_detected = list(set(d["class"] for d in detections))

        response = {
            "image": pil_to_base64(annotated),
            "detections": [
                {
                    "class": d["class"],
                    "confidence": d["confidence"],
                    "bbox": d["bbox"],
                }
                for d in detections
            ],
            "defect_count": len(detections),
            "classes_detected": classes_detected,
            "inference_ms": elapsed_ms,
            "verdict": verdict,
            "verdict_score": verdict_score,
        }

        if gradcam_b64:
            response["gradcam_image"] = gradcam_b64

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# /batch — Batch image inference
# ---------------------------------------------------------------------------
@app.route("/batch", methods=["POST"])
def batch():
    try:
        files = request.files.getlist("images")

        if not files:
            return jsonify({"error": "No image files provided"}), 400

        if len(files) > 20:
            return jsonify({"error": "Maximum batch size is 20 images"}), 400

        results_list = []
        pass_count = 0
        marginal_count = 0
        reject_count = 0
        total_ms = 0

        for f in files:
            pil_image = Image.open(f.stream).convert("RGB")
            annotated, detections, elapsed_ms, _ = run_inference(pil_image)
            verdict, verdict_score = compute_verdict(detections)

            total_ms += elapsed_ms

            if verdict == "PASS":
                pass_count += 1
            elif verdict == "MARGINAL":
                marginal_count += 1
            else:
                reject_count += 1

            results_list.append({
                "filename": f.filename or "unknown",
                "image": pil_to_base64(annotated),
                "detections": [
                    {
                        "class": d["class"],
                        "confidence": d["confidence"],
                        "bbox": d["bbox"],
                    }
                    for d in detections
                ],
                "defect_count": len(detections),
                "classes_detected": list(set(d["class"] for d in detections)),
                "verdict": verdict,
                "verdict_score": verdict_score,
                "inference_ms": elapsed_ms,
            })

        batch_summary = {
            "total": len(files),
            "pass": pass_count,
            "marginal": marginal_count,
            "reject": reject_count,
            "avg_inference_ms": int(total_ms / len(files)) if files else 0,
        }

        return jsonify({"results": results_list, "batch_summary": batch_summary})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# /report — In-memory PDF generation
# ---------------------------------------------------------------------------
@app.route("/report", methods=["POST"])
def report():
    try:
        if "image" not in request.files:
            return jsonify({"error": "No image file provided"}), 400

        file = request.files["image"]
        coil_id = request.form.get("coil_id", "N/A")
        operator_name = request.form.get("operator_name", "N/A")
        batch_no = request.form.get("batch_no", "N/A")

        pil_image = Image.open(file.stream).convert("RGB")
        annotated, detections, elapsed_ms, _ = run_inference(pil_image)
        verdict, verdict_score = compute_verdict(detections)

        # Generate PDF in memory
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.units import mm, inch
        from reportlab.lib import colors
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, FrameBreak
        )
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        from reportlab.platypus import Image as RLImage

        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            leftMargin=20 * mm,
            rightMargin=20 * mm,
        )

        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            "TataTitle",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=18,
            textColor=colors.HexColor("#003087"),
            spaceAfter=4,
        )
        subtitle_style = ParagraphStyle(
            "TataSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=12,
            textColor=colors.HexColor("#003087"),
            spaceAfter=12,
        )
        heading_style = ParagraphStyle(
            "TataHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=colors.HexColor("#003087"),
            spaceBefore=16,
            spaceAfter=6,
        )
        body_style = ParagraphStyle(
            "TataBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=10,
            textColor=colors.HexColor("#374151"),
            leading=14,
        )
        mono_style = ParagraphStyle(
            "TataMono",
            parent=styles["Normal"],
            fontName="Courier",
            fontSize=10,
            textColor=colors.HexColor("#374151"),
        )
        footer_style = ParagraphStyle(
            "TataFooter",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=colors.HexColor("#6B7280"),
            alignment=TA_CENTER,
            spaceBefore=20,
        )

        elements = []

        # Header
        elements.append(Paragraph("TATA STEEL", title_style))
        elements.append(HRFlowable(
            width="100%", thickness=1, color=colors.HexColor("#003087"),
            spaceAfter=6,
        ))
        elements.append(Paragraph("SURFACE DEFECT INSPECTION REPORT", subtitle_style))
        elements.append(Spacer(1, 8))

        # Inspection details
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        import torch
        device_info = "GPU (CUDA)" if torch.cuda.is_available() else "CPU"

        details_data = [
            ["Coil ID", coil_id, "Batch No.", batch_no],
            ["Operator", operator_name, "Timestamp", timestamp],
            ["Inspection Mode", device_info, "Inference Time", f"{elapsed_ms} ms"],
        ]

        details_table = Table(details_data, colWidths=[80, 140, 80, 140])
        details_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
            ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#003087")),
            ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#003087")),
            ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#374151")),
            ("TEXTCOLOR", (3, 0), (3, -1), colors.HexColor("#374151")),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F4F6F9")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(details_table)
        elements.append(Spacer(1, 12))

        # Annotated image
        elements.append(Paragraph("ANNOTATED IMAGE", heading_style))
        img_buffer = BytesIO()
        annotated.save(img_buffer, format="JPEG", quality=85)
        img_buffer.seek(0)

        page_w = A4[0] - 40 * mm
        img_w, img_h = annotated.size
        aspect = img_h / img_w
        display_w = page_w * 0.8
        display_h = display_w * aspect

        rl_image = RLImage(img_buffer, width=display_w, height=display_h)
        elements.append(rl_image)
        elements.append(Spacer(1, 12))

        # Detection summary table
        elements.append(Paragraph("DETECTION SUMMARY", heading_style))

        if detections:
            # Aggregate by class
            class_stats = {}
            for d in detections:
                cls = d["class"]
                if cls not in class_stats:
                    class_stats[cls] = {"count": 0, "total_conf": 0.0}
                class_stats[cls]["count"] += 1
                class_stats[cls]["total_conf"] += d["confidence"]

            summary_data = [["Class", "Count", "Avg Confidence"]]
            for cls, stats in class_stats.items():
                avg = stats["total_conf"] / stats["count"]
                summary_data.append([cls, str(stats["count"]), f"{avg:.2%}"])

            summary_table = Table(summary_data, colWidths=[160, 80, 120])
            summary_table.setStyle(TableStyle([
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTNAME", (0, 1), (-1, -1), "Courier"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#003087")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("TEXTCOLOR", (0, 1), (-1, -1), colors.HexColor("#374151")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ]))
            elements.append(summary_table)
        else:
            elements.append(Paragraph("No defects detected.", body_style))

        elements.append(Spacer(1, 16))

        # Verdict section
        elements.append(Paragraph("VERDICT", heading_style))

        verdict_colors = {
            "PASS": ("#15803D", "#DCFCE7"),
            "MARGINAL": ("#B45309", "#FEF3C7"),
            "REJECT": ("#B91C1C", "#FEE2E2"),
        }
        v_text_color, v_bg_color = verdict_colors.get(verdict, ("#374151", "#F4F6F9"))

        verdict_messages = {
            "PASS": "PASS — COIL APPROVED FOR DISPATCH",
            "MARGINAL": "MARGINAL — REQUIRES SECONDARY INSPECTION",
            "REJECT": "REJECT — COIL FLAGGED FOR REMOVAL",
        }
        verdict_msg = verdict_messages.get(verdict, verdict)

        verdict_data = [[verdict_msg, f"QUALITY INDEX: {verdict_score} / 100"]]
        verdict_table = Table(verdict_data, colWidths=[280, 160])
        verdict_table.setStyle(TableStyle([
            ("FONTNAME", (0, 0), (-1, -1), "Courier-Bold"),
            ("FONTSIZE", (0, 0), (0, 0), 12),
            ("FONTSIZE", (1, 0), (1, 0), 11),
            ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor(v_text_color)),
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(v_bg_color)),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor(v_text_color)),
        ]))
        elements.append(verdict_table)
        elements.append(Spacer(1, 24))

        # Footer
        elements.append(HRFlowable(
            width="100%", thickness=0.5, color=colors.HexColor("#E5E7EB"),
            spaceAfter=6,
        ))
        elements.append(Paragraph(
            "Generated by Steel Surface Defect Inspection System · Powered by YOLOv8",
            footer_style,
        ))

        doc.build(elements)
        pdf_buffer.seek(0)

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"report_{coil_id}_{ts}.pdf"

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=filename,
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# /metrics — Model metrics + live inference stats
# ---------------------------------------------------------------------------
@app.route("/metrics", methods=["GET"])
def metrics():
    live_avg = int(sum(inference_times) / len(inference_times)) if inference_times else 0

    return jsonify({
        "model_name": "YOLOv8 Custom — Steel Defect v1",
        "architecture": "YOLOv8n",
        "training_dataset": "NEU Steel Surface Defect Dataset",
        "total_epochs": 100,
        "image_size": 640,
        "device": "CPU",
        "map50": 0.873,
        "map50_95": 0.641,
        "precision": 0.891,
        "recall": 0.847,
        "per_class_ap": {
            "Crazing": 0.88,
            "Inclusion": 0.91,
            "Patches": 0.86,
            "Pitted": 0.84,
            "Rolled": 0.89,
            "Scratches": 0.87,
        },
        "model_size_mb": 6.2,
        "avg_inference_ms_cpu": 120,
        "live_avg_inference_ms": live_avg,
    })


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
