import { useCallback, useRef, useState } from "react";

import { transcribeAudioBlob } from "./audio/whisper";

type RecorderState = "idle" | "recording" | "ready" | "transcribing" | "error";

export function usePhraseRecorder() {
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const [state, setState] = useState<RecorderState>("idle");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setTranscript("");
    setProgress("");
    chunks.current = [];

    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      recorder.current = new MediaRecorder(stream.current, { mimeType: preferredMimeType() });
      recorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.current.push(event.data);
        }
      };
      recorder.current.onstop = () => {
        const nextBlob = new Blob(chunks.current, { type: recorder.current?.mimeType || "audio/webm" });
        setBlob(nextBlob);
        setState("ready");
        stream.current?.getTracks().forEach((track) => track.stop());
      };
      recorder.current.start();
      setState("recording");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Could not record phrase.";
      setError(message);
      setState("error");
    }
  }, []);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") {
      recorder.current.stop();
    }
  }, []);

  const transcribe = useCallback(async () => {
    if (!blob) {
      return;
    }

    setError(null);
    setState("transcribing");
    try {
      const text = await transcribeAudioBlob(blob, setProgress);
      setTranscript(text || "No speech recognized.");
      setState("ready");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Whisper transcription failed.";
      setError(message);
      setState("error");
    }
  }, [blob]);

  const reset = useCallback(() => {
    setBlob(null);
    setTranscript("");
    setProgress("");
    setError(null);
    setState("idle");
  }, []);

  return {
    state,
    progress,
    transcript,
    error,
    canTranscribe: Boolean(blob) && state !== "transcribing",
    start,
    stop,
    transcribe,
    reset,
  };
}

function preferredMimeType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
}
