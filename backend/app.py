from flask import Flask, request, send_file
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = YOLO("my_model.pt")  

@app.route('/predict', methods=['POST'])
def predict():
    
    try:
        image = Image.open(request.files['image'].stream).convert('RGB')

        results = model.predict(image, device='cpu')  

        result_image = results[0].plot()

        buffer = BytesIO()
        Image.fromarray(result_image).save(buffer, format="JPEG")
        buffer.seek(0)

        return send_file(buffer, mimetype='image/jpeg')

    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
