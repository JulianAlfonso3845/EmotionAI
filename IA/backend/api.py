from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import base64
import io
from PIL import Image
import cv2
from keras.models import load_model

app = Flask(__name__)
CORS(app)

modelo = load_model('modelo_emociones.h5')
clases = np.load('clases.npy')

@app.route('/')
def home():
    return 'API de detección de emociones funcionando.'

@app.route('/detectar', methods=['POST'])
def detectar_emocion():
    try:
        datos = request.get_json()
        imagen_base64 = datos['imagen'].split(',')[1]
        imagen = Image.open(io.BytesIO(base64.b64decode(imagen_base64))).convert('L').resize((48, 48))
        arr = np.array(imagen)
        arr = cv2.equalizeHist(arr)
        arr = arr.astype('float32') / 255.0
        arr = arr.reshape(1, 48, 48, 1)

        pred = modelo.predict(arr)[0]
        emocion_idx = int(np.argmax(pred))
        emocion = clases[emocion_idx].capitalize()

        # Definir video y recomendación
        if emocion == 'Happy':
            video_id = "6Graa_Vm5eA"
            recomendacion = "¡Sigue así! Te recomendamos una canción alegre 🎶"
        elif emocion == 'Sad':
            video_id = "V1bFr2SWP1I"
            recomendacion = "Una melodía suave para mejorar tu ánimo 💛"
        elif emocion == 'Angry':
            video_id = "UfcAVejslrU"
            recomendacion = "Escucha esta música relajante para calmarte 🌿"
        else:
            video_id = "dQw4w9WgXcQ"
            recomendacion = "No pudimos identificar tu emoción con claridad."

        return jsonify({
            'emocion': emocion,
            'recomendacion': recomendacion,
            'video': video_id
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)
