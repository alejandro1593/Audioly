const fs = require('fs');
const path = require('path');

// Genera un archivo WAV de tono de prueba
function generateTone(filename, durationSec, freq = 440, sampleRate = 44100) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // Cabecera WAV
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Muestras (tono con envolvente para evitar clics)
  const amplitude = 8000;
  const fade = Math.floor(sampleRate * 0.05);
  for (let i = 0; i < numSamples; i++) {
    let env = 1;
    if (i < fade) env = i / fade;
    if (i > numSamples - fade) env = (numSamples - i) / fade;
    const sample = Math.sin((2 * Math.PI * freq * i) / sampleRate) * amplitude * env;
    buffer.writeInt16LE(sample, 44 + i * 2);
  }

  fs.writeFileSync(path.join(__dirname, '..', 'uploads', filename), buffer);
  console.log('Generado:', filename);
}

// Tono base 440Hz (tono de referencia tipo "la")
generateTone('audio-demo-1.wav', 8, 440);
generateTone('audio-demo-2.wav', 10, 523.25); // C5
generateTone('audio-demo-3.wav', 12, 659.25); // E5
