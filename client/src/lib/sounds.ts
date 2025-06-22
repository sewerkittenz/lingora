class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds() {
    // Create sound effects using Web Audio API for better performance
    const soundData = {
      correct: this.createBeep(523.25, 0.3, 'square'), // High success tone
      incorrect: this.createBeep(196, 0.5, 'sawtooth'), // Lower error tone  
      skip: this.createBeep(329.63, 0.2, 'sine'), // Neutral skip tone
      click: this.createBeep(800, 0.1, 'square'), // Quick click sound
      finish: this.createMelody([523.25, 659.25, 783.99], 0.4), // Success melody
    };

    Object.entries(soundData).forEach(([name, audio]) => {
      this.sounds.set(name, audio);
    });
  }

  private createBeep(frequency: number, duration: number, type: OscillatorType): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    // Create audio element from the generated sound
    const audio = new Audio();
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    
    // Generate the audio data
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      const t = i / audioContext.sampleRate;
      const envelope = Math.exp(-t * 3) * (t < duration ? 1 : 0);
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    // Convert buffer to blob and create object URL
    const audioBuffer = this.bufferToWave(buffer, audioContext.sampleRate);
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    audio.preload = 'auto';
    
    return audio;
  }

  private createMelody(frequencies: number[], duration: number): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const totalDuration = duration * frequencies.length;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * totalDuration, audioContext.sampleRate);
    const channelData = buffer.getChannelData(0);
    
    frequencies.forEach((freq, index) => {
      const startTime = index * duration;
      const startSample = Math.floor(startTime * audioContext.sampleRate);
      const endSample = Math.floor((startTime + duration) * audioContext.sampleRate);
      
      for (let i = startSample; i < endSample && i < buffer.length; i++) {
        const t = (i - startSample) / audioContext.sampleRate;
        const envelope = Math.exp(-t * 2) * 0.3;
        channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
      }
    });
    
    const audio = new Audio();
    const audioBuffer = this.bufferToWave(buffer, audioContext.sampleRate);
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    audio.src = URL.createObjectURL(blob);
    audio.preload = 'auto';
    
    return audio;
  }

  private bufferToWave(buffer: AudioBuffer, sampleRate: number): ArrayBuffer {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  }

  play(soundName: 'correct' | 'incorrect' | 'skip' | 'click' | 'finish') {
    if (!this.enabled) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(() => {
        // Silently handle autoplay restrictions
      });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const soundManager = new SoundManager();