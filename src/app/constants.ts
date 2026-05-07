import { z } from "zod";

const runtimeConfigSchema = z.object({
  appVersion: z.string().min(1),
  commitSha: z.string().min(1),
  buildTime: z.string().min(1),
  repoUrl: z.string().url(),
  paypalUrl: z.string().url(),
});

export const runtimeConfig = runtimeConfigSchema.parse({
  appVersion: __APP_VERSION__,
  commitSha: __COMMIT_SHA__,
  buildTime: __BUILD_TIME__,
  repoUrl: __REPO_URL__,
  paypalUrl: __PAYPAL_URL__,
});
