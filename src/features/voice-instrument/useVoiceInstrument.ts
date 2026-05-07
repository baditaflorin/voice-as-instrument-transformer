import { useCallback, useEffect, useRef, useState } from "react";

import type { EngineSnapshot, VoiceInstrumentSettings } from "./types";
import { defaultSettings, idleSnapshot } from "./types";

type EngineModule = typeof import("./audio/engine");
type EngineInstance = InstanceType<EngineModule["VoiceInstrumentEngine"]>;

export function useVoiceInstrument() {
  const engine = useRef<EngineInstance | null>(null);
  const [settings, setSettingsState] = useState<VoiceInstrumentSettings>(defaultSettings);
  const [snapshot, setSnapshot] = useState<EngineSnapshot>(idleSnapshot);
  const [error, setError] = useState<string | null>(null);

  const ensureEngine = useCallback(async () => {
    if (engine.current) {
      return engine.current;
    }

    const { VoiceInstrumentEngine } = await import("./audio/engine");
    engine.current = new VoiceInstrumentEngine(setSnapshot, settings);
    return engine.current;
  }, [settings]);

  const startMic = useCallback(async () => {
    setError(null);
    try {
      const activeEngine = await ensureEngine();
      await activeEngine.startMic();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not open microphone.";
      setError(message);
      setSnapshot((current) => ({ ...current, status: "error", message }));
    }
  }, [ensureEngine]);

  const startDemo = useCallback(async () => {
    setError(null);
    try {
      const activeEngine = await ensureEngine();
      await activeEngine.startDemo();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not start demo.";
      setError(message);
      setSnapshot((current) => ({ ...current, status: "error", message }));
    }
  }, [ensureEngine]);

  const stop = useCallback(() => {
    engine.current?.stop();
    engine.current = null;
    setError(null);
    setSnapshot(idleSnapshot);
  }, []);

  const setSettings = useCallback((next: Partial<VoiceInstrumentSettings>) => {
    setSettingsState((current) => {
      const merged = { ...current, ...next };
      engine.current?.setSettings(next);
      return merged;
    });
  }, []);

  useEffect(() => () => engine.current?.stop(), []);

  return {
    settings,
    snapshot,
    error,
    startMic,
    startDemo,
    stop,
    setSettings,
  };
}
