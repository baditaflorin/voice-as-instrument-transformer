import { PitchDetector } from "pitchy";

import type {
  EngineListener,
  EngineSnapshot,
  FocusMode,
  InstrumentId,
  SourceMode,
  VoiceInstrumentSettings,
} from "../types";
import { defaultSettings, idleSnapshot } from "../types";
import { clamp, frequencyToNote, rootMeanSquare, smoothFrequency } from "./pitch";
import { snapFrequency } from "./scale";

type ToneModule = typeof import("tone");

type ToneInstrument = {
  triggerAttack: (frequency: number, time?: number, velocity?: number) => void;
  triggerRelease: (time?: number) => void;
  frequency?: {
    rampTo: (frequency: number, time: number) => void;
    value: number;
  };
  connect: (destination: unknown) => ToneInstrument;
  dispose: () => void;
};

export class VoiceInstrumentEngine {
  private settings: VoiceInstrumentSettings = { ...defaultSettings };
  private listener: EngineListener;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private sourceNode: AudioNode | null = null;
  private oscillator: OscillatorNode | null = null;
  private demoInterval: number | null = null;
  private analyser: AnalyserNode | null = null;
  private dryGain: GainNode | null = null;
  private focusNodes: AudioNode[] = [];
  private detector: PitchDetector<Float32Array> | null = null;
  private buffer = new Float32Array(2048);
  private frameId: number | null = null;
  private tone: ToneModule | null = null;
  private instrument: ToneInstrument | null = null;
  private destination: unknown = null;
  private noteActive = false;
  private smoothedPitch: number | null = null;
  private sourceMode: SourceMode = "idle";
  private lastSnapshot: EngineSnapshot = idleSnapshot;

  constructor(listener: EngineListener, settings?: Partial<VoiceInstrumentSettings>) {
    this.listener = listener;
    this.settings = { ...this.settings, ...settings };
  }

  async startMic() {
    this.emit({ status: "loading", sourceMode: "mic", message: "Opening microphone" });
    await this.prepareAudioContext();
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    });

    this.sourceMode = "mic";
    const audioContext = this.requireAudioContext();
    this.sourceNode = audioContext.createMediaStreamSource(this.stream);
    await this.startGraph();
  }

  async startDemo() {
    this.emit({ status: "loading", sourceMode: "demo", message: "Starting demo oscillator" });
    await this.prepareAudioContext();
    const audioContext = this.requireAudioContext();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    gain.gain.value = 0.18;
    oscillator.type = "sine";
    oscillator.frequency.value = 220;
    oscillator.connect(gain);
    oscillator.start();

    this.oscillator = oscillator;
    this.sourceNode = gain;
    this.sourceMode = "demo";

    let index = 0;
    const notes = [196, 220, 246.94, 293.66, 329.63, 392, 440, 392, 329.63, 293.66];
    this.demoInterval = window.setInterval(() => {
      const next = notes[index % notes.length];
      oscillator.frequency.setTargetAtTime(next, audioContext.currentTime, 0.03);
      index += 1;
    }, 420);

    await this.startGraph();
  }

  setSettings(next: Partial<VoiceInstrumentSettings>) {
    const previousInstrument = this.settings.instrument;
    const previousFocusMode = this.settings.focusMode;
    this.settings = { ...this.settings, ...next };

    if (this.dryGain) {
      this.dryGain.gain.setTargetAtTime(
        clamp(this.settings.dryMix, 0, 0.35),
        this.audioContext?.currentTime ?? 0,
        0.02,
      );
    }

    if (next.instrument && next.instrument !== previousInstrument && this.tone) {
      this.createInstrument(next.instrument);
    }

    if (next.focusMode && next.focusMode !== previousFocusMode && this.sourceNode && this.analyser) {
      this.connectAnalysisGraph(this.sourceNode, next.focusMode);
    }
  }

  getStream() {
    return this.stream;
  }

  stop() {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }
    if (this.demoInterval !== null) {
      window.clearInterval(this.demoInterval);
    }

    this.releaseNote();
    this.instrument?.dispose();
    this.instrument = null;
    this.oscillator?.stop();
    this.oscillator = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.sourceNode?.disconnect();
    this.dryGain?.disconnect();
    this.focusNodes.forEach((node) => node.disconnect());
    this.analyser?.disconnect();

    this.sourceNode = null;
    this.dryGain = null;
    this.analyser = null;
    this.focusNodes = [];
    this.detector = null;
    this.frameId = null;
    this.demoInterval = null;
    this.smoothedPitch = null;
    this.sourceMode = "idle";
    this.emit({ ...idleSnapshot });
  }

  private async prepareAudioContext() {
    if (this.audioContext?.state === "running") {
      await this.ensureTone();
      return;
    }

    const AudioContextCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) {
      throw new Error("This browser does not expose Web Audio.");
    }

    this.audioContext = new AudioContextCtor({ latencyHint: "interactive" });
    await this.audioContext.resume();
    await this.ensureTone();
  }

  private requireAudioContext() {
    if (!this.audioContext) {
      throw new Error("Audio context was not initialized.");
    }

    return this.audioContext;
  }

  private async ensureTone() {
    if (this.tone) {
      return;
    }

    this.tone = await import("tone");
    this.tone.setContext(this.audioContext as any);
    await this.tone.start();
    this.destination = new this.tone.Gain(0.84).toDestination();
    this.createInstrument(this.settings.instrument);
  }

  private async startGraph() {
    if (!this.audioContext || !this.sourceNode) {
      throw new Error("Audio source was not initialized.");
    }

    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.18;
    this.buffer = new Float32Array(this.analyser.fftSize);
    this.detector = PitchDetector.forFloat32Array(this.buffer.length);
    this.dryGain = this.audioContext.createGain();
    this.dryGain.gain.value = clamp(this.settings.dryMix, 0, 0.35);

    this.connectAnalysisGraph(this.sourceNode, this.settings.focusMode);
    this.emit({ status: "listening", sourceMode: this.sourceMode, message: "Listening" });
    this.loop();
  }

  private connectAnalysisGraph(source: AudioNode, focusMode: FocusMode) {
    if (!this.audioContext || !this.analyser || !this.dryGain) {
      return;
    }

    source.disconnect();
    this.focusNodes.forEach((node) => node.disconnect());
    this.focusNodes = [];

    if (this.sourceMode === "mic") {
      source.connect(this.dryGain);
      this.dryGain.connect(this.audioContext.destination);
    }

    if (focusMode === "demucs-lite") {
      const highpass = this.audioContext.createBiquadFilter();
      highpass.type = "highpass";
      highpass.frequency.value = 70;

      const lowpass = this.audioContext.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 1450;

      const compressor = this.audioContext.createDynamicsCompressor();
      compressor.threshold.value = -46;
      compressor.knee.value = 18;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.12;

      source.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(compressor);
      compressor.connect(this.analyser);
      this.focusNodes = [highpass, lowpass, compressor];
      return;
    }

    source.connect(this.analyser);
  }

  private createInstrument(instrumentId: InstrumentId) {
    if (!this.tone || !this.destination) {
      return;
    }

    this.releaseNote();
    this.instrument?.dispose();

    if (instrumentId === "rhodes") {
      const chorus = new this.tone.Chorus(4.1, 2.2, 0.38).start();
      const tremolo = new this.tone.Tremolo(4.6, 0.22).start();
      const reverb = new this.tone.JCReverb(0.32);
      const synth = new this.tone.FMSynth({
        harmonicity: 2.9,
        modulationIndex: 12,
        oscillator: { type: "sine" },
        envelope: { attack: 0.012, decay: 0.42, sustain: 0.38, release: 0.72 },
        modulation: { type: "triangle" },
        modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.18, release: 0.45 },
      });
      synth.chain(chorus, tremolo, reverb, this.destination as any);
      this.instrument = synth as unknown as ToneInstrument;
      return;
    }

    if (instrumentId === "cello") {
      const filter = new this.tone.Filter(640, "lowpass");
      const vibrato = new this.tone.Vibrato(5.2, 0.12);
      const reverb = new this.tone.Reverb({ decay: 2.6, wet: 0.28 });
      const synth = new this.tone.MonoSynth({
        oscillator: { type: "sawtooth" },
        filter: { Q: 1.2, type: "lowpass", rolloff: -24 },
        envelope: { attack: 0.16, decay: 0.28, sustain: 0.7, release: 0.36 },
        filterEnvelope: { attack: 0.06, decay: 0.28, sustain: 0.38, release: 0.24, baseFrequency: 110, octaves: 2.3 },
      });
      synth.chain(vibrato, filter, reverb, this.destination as any);
      this.instrument = synth as unknown as ToneInstrument;
      return;
    }

    const delay = new this.tone.FeedbackDelay("8n", 0.22);
    const filter = new this.tone.Filter(1200, "lowpass");
    const synth = new this.tone.DuoSynth({
      vibratoAmount: 0.22,
      vibratoRate: 5.1,
      harmonicity: 1.51,
      voice0: {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.02, decay: 0.12, sustain: 0.58, release: 0.24 },
      },
      voice1: {
        oscillator: { type: "square" },
        envelope: { attack: 0.03, decay: 0.14, sustain: 0.48, release: 0.28 },
      },
    });
    synth.chain(filter, delay, this.destination as any);
    this.instrument = synth as unknown as ToneInstrument;
  }

  private loop = () => {
    if (!this.analyser || !this.detector) {
      return;
    }

    this.analyser.getFloatTimeDomainData(this.buffer);
    const [pitch, clarity] = this.detector.findPitch(this.buffer, this.audioContext?.sampleRate ?? 44100);
    const rms = rootMeanSquare(this.buffer);
    const clarityThreshold = 0.9 - this.settings.sensitivity * 0.38;
    const rmsThreshold = 0.004 + (1 - this.settings.sensitivity) * 0.018;
    const hasPitch =
      Number.isFinite(pitch) && pitch >= 55 && pitch <= 1400 && clarity >= clarityThreshold && rms >= rmsThreshold;

    if (hasPitch) {
      const shiftedPitch = pitch * 2 ** this.settings.octaveShift;
      const smoothed = smoothFrequency(this.smoothedPitch, shiftedPitch);
      this.smoothedPitch = smoothed;
      const snap = snapFrequency(smoothed, this.settings.rootNote, this.settings.scale);
      const playFrequency = snap.frequency || smoothed;
      const note = frequencyToNote(playFrequency);
      const velocity = clamp(rms * 8.4, 0.12, 0.95);
      this.playFrequency(playFrequency, velocity);
      this.emit({
        status: "playing",
        sourceMode: this.sourceMode,
        pitchHz: playFrequency,
        rawPitchHz: smoothed,
        noteName: note.noteName,
        cents: note.cents,
        scaleCents: snap.centsFromInput,
        clarity,
        rms,
        latencyMs: Math.round(
          (this.buffer.length / (this.audioContext?.sampleRate ?? 44100)) * 1000 + this.settings.glideMs,
        ),
        message: this.sourceMode === "demo" ? "Demo playing" : "Voice locked",
      });
    } else {
      this.releaseNote();
      this.smoothedPitch = null;
      this.emit({
        status: "listening",
        sourceMode: this.sourceMode,
        pitchHz: null,
        rawPitchHz: null,
        noteName: "--",
        cents: 0,
        scaleCents: 0,
        clarity,
        rms,
        latencyMs: Math.round(
          (this.buffer.length / (this.audioContext?.sampleRate ?? 44100)) * 1000 + this.settings.glideMs,
        ),
        message: this.sourceMode === "demo" ? "Demo waiting" : "Listening",
      });
    }

    this.frameId = requestAnimationFrame(this.loop);
  };

  private playFrequency(frequency: number, velocity: number) {
    if (!this.instrument || !this.audioContext) {
      return;
    }

    const glideSeconds = clamp(this.settings.glideMs / 1000, 0.005, 0.25);
    if (this.noteActive) {
      if (this.instrument.frequency?.rampTo) {
        this.instrument.frequency.rampTo(frequency, glideSeconds);
      }
      return;
    }

    this.instrument.triggerAttack(frequency, this.audioContext.currentTime, velocity);
    this.noteActive = true;
  }

  private releaseNote() {
    if (this.noteActive) {
      this.instrument?.triggerRelease(this.audioContext?.currentTime);
      this.noteActive = false;
    }
  }

  private emit(snapshot: Partial<EngineSnapshot>) {
    this.lastSnapshot = {
      ...this.lastSnapshot,
      ...snapshot,
    };
    this.listener(this.lastSnapshot);
  }
}
