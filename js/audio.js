// === js/audio.js — SoundEngine: synthesized retro CRT SFX via Web Audio API (no external files).
// Load order: 1st. Exposes global `sfx`. ===
    /**
     * Synthesized Retro CRT Audio Feedback (Web Audio API - zero external files)
     */
    class SoundEngine {
      constructor() {
        this.enabled = true;
        this.ctx = null;
      }

      init() {
        if (!this.ctx) {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) this.ctx = new AudioContext();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
      }

      playTone(freq, type = 'sine', duration = 0.09, volume = 0.06, delay = 0) {
        if (!this.enabled) return;
        try {
          this.init();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
          gain.gain.setValueAtTime(volume, this.ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delay + duration);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + delay);
          osc.stop(this.ctx.currentTime + delay + duration);
        } catch (e) { /* ignore */ }
      }

      playSuccess() {
        this.playTone(523.25, 'triangle', 0.08, 0.07, 0);
        this.playTone(659.25, 'triangle', 0.12, 0.07, 0.07);
      }

      playError() {
        this.playTone(190, 'sawtooth', 0.14, 0.07, 0);
        this.playTone(145, 'sawtooth', 0.18, 0.07, 0.11);
      }

      playVictory() {
        this.playTone(523.25, 'triangle', 0.1, 0.08, 0);
        this.playTone(659.25, 'triangle', 0.1, 0.08, 0.09);
        this.playTone(783.99, 'triangle', 0.1, 0.08, 0.18);
        this.playTone(1046.5, 'triangle', 0.25, 0.09, 0.27);
      }

      playAlarm() {
        this.playTone(220, 'square', 0.12, 0.06, 0);
        this.playTone(180, 'square', 0.12, 0.06, 0.14);
        this.playTone(220, 'square', 0.12, 0.06, 0.28);
        this.playTone(150, 'square', 0.25, 0.07, 0.42);
      }
    }

    const sfx = new SoundEngine();
