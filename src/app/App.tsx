import {
  Activity,
  Captions,
  GitCommit,
  Heart,
  Mic,
  Music2,
  Piano,
  Play,
  Radio,
  RefreshCcw,
  SlidersHorizontal,
  Sparkles,
  Square,
  Waves,
} from "lucide-react";

import { runtimeConfig } from "./constants";
import { usePhraseRecorder } from "../features/voice-instrument/usePhraseRecorder";
import { useVoiceInstrument } from "../features/voice-instrument/useVoiceInstrument";
import type { EngineSnapshot, InstrumentId, VoiceInstrumentSettings } from "../features/voice-instrument/types";
import { instruments } from "../features/voice-instrument/types";
import { allRoots, allScales, rootLabels, scaleLabels } from "../features/voice-instrument/audio/scale";

export function App() {
  const voice = useVoiceInstrument();
  const recorder = usePhraseRecorder();
  const isActive = voice.snapshot.status === "listening" || voice.snapshot.status === "playing";

  return (
    <main className="min-h-screen bg-paper text-ink">
      <Header />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(360px,0.88fr)] lg:px-8">
        <div className="space-y-5">
          <PerformanceDeck snapshot={voice.snapshot} isActive={isActive} />
          <Transport
            isActive={isActive}
            status={voice.snapshot.status}
            onStartMic={voice.startMic}
            onStartDemo={voice.startDemo}
            onStop={voice.stop}
          />
          {voice.error ? <Toast message={voice.error} /> : null}
          <InstrumentSelector
            selected={voice.settings.instrument}
            onChange={(instrument) => voice.setSettings({ instrument })}
          />
        </div>

        <aside className="space-y-5">
          <TuningPanel snapshot={voice.snapshot} settings={voice.settings} onChange={voice.setSettings} />
          <WhisperPanel recorder={recorder} />
          <RuntimePanel />
        </aside>
      </section>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-ink/10 bg-ink text-paper">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-mint text-ink">
            <Waves aria-hidden="true" size={28} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">Mode A / GitHub Pages</p>
            <h1 className="truncate text-2xl font-semibold sm:text-3xl">Voice-as-Instrument Transformer</h1>
          </div>
        </div>

        <nav aria-label="Project links" className="flex flex-wrap items-center gap-2">
          <a
            className="link-button border-paper/25 text-paper hover:bg-paper hover:text-ink"
            href={runtimeConfig.repoUrl}
          >
            <GitCommit aria-hidden="true" size={17} />
            GitHub
          </a>
          <a className="link-button border-mint/45 bg-mint text-ink hover:bg-paper" href={runtimeConfig.repoUrl}>
            <Sparkles aria-hidden="true" size={17} />
            Star repo
          </a>
          <a
            className="link-button border-paper/25 text-paper hover:bg-paper hover:text-ink"
            href={runtimeConfig.paypalUrl}
          >
            <Heart aria-hidden="true" size={17} />
            PayPal
          </a>
        </nav>
      </div>
    </header>
  );
}

function PerformanceDeck({ snapshot, isActive }: { snapshot: EngineSnapshot; isActive: boolean }) {
  return (
    <section
      className="overflow-hidden rounded-lg border border-ink/10 bg-ink text-paper shadow-sm"
      aria-label="Performance display"
    >
      <div className="grid min-h-[430px] grid-rows-[auto_1fr_auto]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper/10 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-mint">{snapshot.sourceMode}</p>
            <p className="mt-1 text-sm text-paper/70">{snapshot.message}</p>
          </div>
          <StatusPill snapshot={snapshot} />
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_220px]">
          <VoiceScope snapshot={snapshot} isActive={isActive} />
          <div className="flex flex-col justify-between gap-4 rounded-md border border-paper/10 bg-paper/[0.04] p-4">
            <div>
              <p className="text-sm uppercase tracking-[0.18em] text-paper/55">Pitch</p>
              <p className="mt-2 text-6xl font-semibold leading-none" data-testid="pitch-note">
                {snapshot.noteName}
              </p>
              <p className="mt-2 text-lg text-mint">
                {snapshot.pitchHz ? `${snapshot.pitchHz.toFixed(1)} Hz` : "No lock"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Meter label="Clarity" value={snapshot.clarity} />
              <Meter label="Level" value={snapshot.rms * 10} />
            </div>
          </div>
        </div>

        <div className="grid gap-2 border-t border-paper/10 px-5 py-4 text-sm text-paper/65 sm:grid-cols-3">
          <span>Cents {snapshot.pitchHz ? signed(snapshot.cents) : "--"}</span>
          <span>Latency {snapshot.latencyMs || "--"} ms</span>
          <span>Commit {runtimeConfig.commitSha}</span>
        </div>
      </div>
    </section>
  );
}

function VoiceScope({ snapshot, isActive }: { snapshot: EngineSnapshot; isActive: boolean }) {
  const bars = Array.from({ length: 36 }, (_, index) => {
    const wave = Math.sin(index * 0.62 + (snapshot.pitchHz ?? 80) / 80);
    const clarityBoost = snapshot.clarity * 45;
    const pitchBoost = snapshot.pitchHz ? Math.min(55, snapshot.pitchHz / 14) : 0;
    return 18 + Math.abs(wave) * 54 + clarityBoost + pitchBoost * (index % 5 === 0 ? 0.45 : 0.18);
  });

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-md border border-paper/10 bg-[#171c1d] p-4">
      <div className="absolute inset-x-0 top-1/2 h-px bg-paper/10" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-paper/10" />
      <div className="relative flex h-full items-center justify-center gap-2" aria-hidden="true">
        {bars.map((height, index) => (
          <span
            className={[
              "block w-full max-w-3 rounded-full transition-all duration-100",
              isActive ? "bg-mint" : "bg-paper/18",
              snapshot.status === "playing" && index % 3 === 0 ? "bg-brass" : "",
            ].join(" ")}
            key={index}
            style={{ height: `${Math.min(height, 92)}%` }}
          />
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-paper/45">Voice controller</p>
          <p className="mt-1 text-xl font-semibold">{snapshot.status === "playing" ? "Locked" : "Armed"}</p>
        </div>
        <Radio className={snapshot.status === "playing" ? "text-mint" : "text-paper/35"} aria-hidden="true" size={30} />
      </div>
    </div>
  );
}

function Transport({
  isActive,
  status,
  onStartMic,
  onStartDemo,
  onStop,
}: {
  isActive: boolean;
  status: EngineSnapshot["status"];
  onStartMic: () => void;
  onStartDemo: () => void;
  onStop: () => void;
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-3" aria-label="Transport">
      <button className="primary-button" disabled={status === "loading"} onClick={onStartMic}>
        <Mic aria-hidden="true" size={20} />
        Start mic
      </button>
      <button className="secondary-button" disabled={status === "loading"} onClick={onStartDemo}>
        <Play aria-hidden="true" size={20} />
        Try demo
      </button>
      <button className="secondary-button" disabled={!isActive} onClick={onStop}>
        <Square aria-hidden="true" size={20} />
        Stop
      </button>
    </section>
  );
}

function InstrumentSelector({
  selected,
  onChange,
}: {
  selected: InstrumentId;
  onChange: (instrument: InstrumentId) => void;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm" aria-label="Instrument selector">
      <div className="mb-3 flex items-center gap-2">
        <Music2 aria-hidden="true" size={18} />
        <h2 className="text-lg font-semibold">Instrument</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {instruments.map((instrument) => (
          <button
            aria-pressed={instrument.id === selected}
            className="instrument-button"
            key={instrument.id}
            onClick={() => onChange(instrument.id)}
          >
            {instrument.id === "rhodes" ? (
              <Piano aria-hidden="true" size={22} />
            ) : (
              <Waves aria-hidden="true" size={22} />
            )}
            <span>{instrument.label}</span>
            <small>{instrument.tone}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function TuningPanel({
  snapshot,
  settings,
  onChange,
}: {
  snapshot: EngineSnapshot;
  settings: VoiceInstrumentSettings;
  onChange: (settings: Partial<VoiceInstrumentSettings>) => void;
}) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm" aria-label="Tuning controls">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal aria-hidden="true" size={18} />
          <h2 className="text-lg font-semibold">Tuning</h2>
        </div>
        <span className="rounded-md border border-ink/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
          {snapshot.status}
        </span>
      </div>

      <div className="space-y-4">
        <RangeControl
          label="Sensitivity"
          max={1}
          min={0}
          step={0.01}
          value={settings.sensitivity}
          valueLabel={`${Math.round(settings.sensitivity * 100)}%`}
          onChange={(sensitivity) => onChange({ sensitivity })}
        />
        <RangeControl
          label="Glide"
          max={180}
          min={5}
          step={1}
          value={settings.glideMs}
          valueLabel={`${settings.glideMs} ms`}
          onChange={(glideMs) => onChange({ glideMs })}
        />
        <RangeControl
          label="Dry voice"
          max={0.35}
          min={0}
          step={0.01}
          value={settings.dryMix}
          valueLabel={`${Math.round(settings.dryMix * 100)}%`}
          onChange={(dryMix) => onChange({ dryMix })}
        />

        <div className="grid gap-2">
          <span className="text-sm font-semibold text-ink/70">Octave</span>
          <div className="grid grid-cols-3 gap-2">
            {[-1, 0, 1].map((octaveShift) => (
              <button
                aria-pressed={settings.octaveShift === octaveShift}
                className="toggle-button"
                key={octaveShift}
                onClick={() => onChange({ octaveShift })}
              >
                {octaveShift > 0 ? `+${octaveShift}` : octaveShift}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-paper/65 px-3 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-ink/75">
            <Activity aria-hidden="true" size={17} />
            Demucs-lite focus
          </span>
          <input
            checked={settings.focusMode === "demucs-lite"}
            className="h-5 w-5 accent-mint"
            type="checkbox"
            onChange={(event) => onChange({ focusMode: event.currentTarget.checked ? "demucs-lite" : "raw" })}
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-ink/70">
            Scale
            <select
              className="rounded-md border border-ink/10 bg-paper px-2 py-2 text-ink"
              value={settings.scale}
              onChange={(event) => onChange({ scale: event.currentTarget.value as VoiceInstrumentSettings["scale"] })}
            >
              {allScales.map((scaleId) => (
                <option key={scaleId} value={scaleId}>
                  {scaleLabels[scaleId]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-ink/70">
            Root
            <select
              className="rounded-md border border-ink/10 bg-paper px-2 py-2 text-ink disabled:opacity-50"
              disabled={settings.scale === "chromatic"}
              value={settings.rootNote}
              onChange={(event) =>
                onChange({ rootNote: event.currentTarget.value as VoiceInstrumentSettings["rootNote"] })
              }
            >
              {allRoots.map((root) => (
                <option key={root} value={root}>
                  {rootLabels[root]}
                </option>
              ))}
            </select>
          </label>
        </div>
        {snapshot.rawPitchHz !== null && settings.scale !== "chromatic" ? (
          <p className="text-xs font-medium text-ink/60">
            Snap: {snapshot.scaleCents > 0 ? "+" : ""}
            {snapshot.scaleCents} cents · raw {snapshot.rawPitchHz.toFixed(1)} Hz → {snapshot.noteName}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function WhisperPanel({ recorder }: { recorder: ReturnType<typeof usePhraseRecorder> }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm" aria-label="Whisper transcription">
      <div className="mb-4 flex items-center gap-2">
        <Captions aria-hidden="true" size={18} />
        <h2 className="text-lg font-semibold">Whisper</h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {recorder.state === "recording" ? (
          <button className="primary-button" onClick={recorder.stop}>
            <Square aria-hidden="true" size={18} />
            Stop capture
          </button>
        ) : (
          <button className="secondary-button" onClick={recorder.start}>
            <Mic aria-hidden="true" size={18} />
            Capture phrase
          </button>
        )}
        <button className="secondary-button" disabled={!recorder.canTranscribe} onClick={recorder.transcribe}>
          <Captions aria-hidden="true" size={18} />
          Transcribe
        </button>
      </div>

      <div className="mt-3 min-h-20 rounded-md border border-ink/10 bg-paper/70 p-3 text-sm">
        {recorder.state === "transcribing" ? <p>{recorder.progress || "Loading Whisper"}</p> : null}
        {recorder.transcript ? <p className="font-medium">{recorder.transcript}</p> : null}
        {recorder.error ? <p className="text-berry">{recorder.error}</p> : null}
        {!recorder.progress && !recorder.transcript && !recorder.error ? (
          <p className="text-ink/50">No phrase captured</p>
        ) : null}
      </div>

      <button
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink/65 hover:text-ink"
        onClick={recorder.reset}
      >
        <RefreshCcw aria-hidden="true" size={15} />
        Reset
      </button>
    </section>
  );
}

function RuntimePanel() {
  return (
    <section className="rounded-lg border border-ink/10 bg-white/70 p-4 shadow-sm" aria-label="Runtime details">
      <div className="grid gap-2 text-sm">
        <RuntimeRow label="Version" value={runtimeConfig.appVersion} />
        <RuntimeRow label="Commit" value={runtimeConfig.commitSha} />
        <RuntimeRow label="Built" value={new Date(runtimeConfig.buildTime).toLocaleString()} />
        <RuntimeRow
          label="Repo"
          value={runtimeConfig.repoUrl.replace("https://github.com/", "")}
          href={runtimeConfig.repoUrl}
        />
        <RuntimeRow label="Support" value="paypal.me/florinbadita" href={runtimeConfig.paypalUrl} />
      </div>
    </section>
  );
}

function RuntimeRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/10 py-2 last:border-b-0">
      <span className="font-semibold text-ink/55">{label}</span>
      {href ? (
        <a
          className="max-w-[230px] truncate text-right font-semibold text-cobalt underline-offset-4 hover:underline"
          href={href}
        >
          {value}
        </a>
      ) : (
        <span className="max-w-[230px] truncate text-right font-semibold">{value}</span>
      )}
    </div>
  );
}

function RangeControl({
  label,
  min,
  max,
  step,
  value,
  valueLabel,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  valueLabel: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink/70">
        {label}
        <span>{valueLabel}</span>
      </span>
      <input
        className="accent-mint"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
      />
    </label>
  );
}

function StatusPill({ snapshot }: { snapshot: EngineSnapshot }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-paper/15 bg-paper/[0.06] px-3 py-2 text-sm font-semibold">
      <span
        className={[
          "h-2.5 w-2.5 rounded-full",
          snapshot.status === "playing" ? "bg-mint" : "",
          snapshot.status === "listening" ? "bg-brass" : "",
          snapshot.status === "loading" ? "bg-cobalt" : "",
          snapshot.status === "error" ? "bg-berry" : "",
          snapshot.status === "idle" ? "bg-paper/30" : "",
        ].join(" ")}
      />
      {snapshot.status}
    </div>
  );
}

function Meter({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(value, 1));
  return (
    <div className="rounded-md border border-paper/10 bg-ink/30 p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-paper/45">{label}</p>
      <div className="mt-2 h-2 rounded-full bg-paper/10">
        <div className="h-full rounded-full bg-mint" style={{ width: `${Math.round(clamped * 100)}%` }} />
      </div>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className="rounded-md border border-berry/30 bg-berry/10 px-4 py-3 text-sm font-semibold text-berry"
      role="alert"
    >
      {message}
    </div>
  );
}

function signed(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}
