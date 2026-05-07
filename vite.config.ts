import react from "@vitejs/plugin-react";
import { execSync } from "node:child_process";
import { defineConfig } from "vitest/config";

const fallbackBase = "/voice-as-instrument-transformer/";
const appBase = process.env.VITE_APP_BASE ?? fallbackBase;

function readGitValue(command: string, fallback: string) {
  try {
    return execSync(command, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

export default defineConfig({
  base: appBase,
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? "0.1.0"),
    __COMMIT_SHA__: JSON.stringify(readGitValue("git rev-parse --short HEAD", "dev")),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __REPO_URL__: JSON.stringify(
      process.env.VITE_REPO_URL ?? "https://github.com/baditaflorin/voice-as-instrument-transformer",
    ),
    __PAYPAL_URL__: JSON.stringify(process.env.VITE_PAYPAL_URL ?? "https://www.paypal.com/paypalme/florinbadita"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "react";
          }
          if (id.includes("node_modules/@tanstack/react-query")) {
            return "query";
          }
          if (id.includes("node_modules/tone") || id.includes("node_modules/pitchy")) {
            return "audio";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
});
