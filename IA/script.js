const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const img = document.getElementById('imagen');
const archivo = document.getElementById('archivo');
const capturarBtn = document.getElementById('capturar');
const enviarBtn = document.getElementById('enviar');
const resultado = document.getElementById('resultado');
const efectos = document.getElementById('efectos');
const youtube = document.getElementById('youtube');

const sonidos = {
  happy: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'),
  sad: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'),
  angry: new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3')
};

const emojis = {
  happy: ['😊', '🎉', '✨'],
  sad: ['😢', '💙', '🌧️'],
  angry: ['😠', '🔥', '💢']
};

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => video.srcObject = stream)
  .catch(err => {
    resultado.innerHTML = "<p>No se pudo acceder a la cámara.</p>";
  });

capturarBtn.onclick = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);
  img.src = canvas.toDataURL('image/jpeg');
};

archivo.onchange = e => {
  const reader = new FileReader();
  reader.onload = () => img.src = reader.result;
  reader.readAsDataURL(e.target.files[0]);
};

function mostrarEmocion(emocion) {
  efectos.innerHTML = '';
  const lista = emojis[emocion] || ['✨'];
  for (let key in sonidos) sonidos[key].pause();
  if (sonidos[emocion]) {
    sonidos[emocion].currentTime = 0;
    sonidos[emocion].play();
  }
  for (let i = 0; i < 20; i++) {
    const emoji = document.createElement('div');
    emoji.className = 'emoji';
    emoji.textContent = lista[i % lista.length];
    emoji.style.left = `${Math.random() * 100}%`;
    emoji.style.animationDelay = `${Math.random() * 2}s`;
    efectos.appendChild(emoji);
  }
}

enviarBtn.onclick = () => {
  if (!img.src || img.src === window.location.href) {
    resultado.innerHTML = "<p>Por favor, captura o sube una imagen primero.</p>";
    return;
  }
  enviarBtn.disabled = true;
  resultado.innerHTML = "<p>Detectando emoción...</p>";
  fetch('http://localhost:8000/detectar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imagen: img.src })
  })
  .then(res => res.json())
  .then(data => {
    console.log("Respuesta del backend:", data);
    const emocion = data.emocion.toLowerCase();
    mostrarEmocion(emocion);
    resultado.innerHTML = `
      <h3>Emoción detectada: ${data.emocion}</h3>
      <p>${data.recomendacion}</p>
    `;
    youtube.innerHTML = `
      <iframe width="100%" height="315" src="https://www.youtube.com/embed/${data.video}?autoplay=1&mute=1"
      title="Video de recomendación" frameborder="0"
      allow="autoplay; encrypted-media" allowfullscreen></iframe>
    `;
  })
  .catch(err => {
    console.error(err);
    resultado.innerHTML = "<p>Error al detectar emoción.</p>";
  })
  .finally(() => {
    enviarBtn.disabled = false;
  });
};
