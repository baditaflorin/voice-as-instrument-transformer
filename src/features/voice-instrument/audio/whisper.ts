type ProgressCallback = (message: string) => void;

let transcriberPromise: Promise<any> | null = null;

export async function transcribeAudioBlob(blob: Blob, onProgress: ProgressCallback) {
  onProgress("Preparing audio");
  const samples = await decodeToMonoSamples(blob);

  onProgress("Loading Whisper tiny");
  const transcriber = await loadTranscriber(onProgress);

  onProgress("Transcribing locally");
  const result = await transcriber(samples, {
    language: "english",
    task: "transcribe",
    chunk_length_s: 20,
    stride_length_s: 4,
  });

  if (typeof result === "string") {
    return result;
  }

  return String(result.text ?? "").trim();
}

async function loadTranscriber(onProgress: ProgressCallback) {
  if (!transcriberPromise) {
    transcriberPromise = import("@huggingface/transformers").then(async ({ env, pipeline }) => {
      env.allowLocalModels = false;
      const wasmBackend = env.backends.onnx.wasm as { numThreads?: number } | undefined;
      if (wasmBackend) {
        wasmBackend.numThreads = Math.max(1, Math.min(4, navigator.hardwareConcurrency ?? 2));
      }
      return pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en", {
        dtype: "q8",
        progress_callback: (progress: { status?: string; file?: string; progress?: number }) => {
          if (progress.status === "progress" && typeof progress.progress === "number") {
            onProgress(`Whisper ${Math.round(progress.progress)}%`);
          } else if (progress.file) {
            onProgress(`Loading ${progress.file}`);
          }
        },
      });
    });
  }

  return transcriberPromise;
}

async function decodeToMonoSamples(blob: Blob) {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext({ sampleRate: 16000 });
  const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
  const channel = decoded.getChannelData(0);

  if (decoded.sampleRate === 16000) {
    await audioContext.close();
    return channel;
  }

  const offline = new OfflineAudioContext(1, Math.ceil((decoded.duration || 1) * 16000), 16000);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  await audioContext.close();
  return rendered.getChannelData(0);
}
