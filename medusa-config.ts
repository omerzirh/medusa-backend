import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils";
import type { ProjectConfigOptions } from "@medusajs/framework";

loadEnv(process.env.NODE_ENV, process.cwd());

// Define constants that were previously imported
const SSL_CONFIG = process.env.NODE_ENV === "production"
  ? { ssl: { rejectUnauthorized: false } }
  : { ssl: false };

// Properly type the worker mode
const WORKER_MODE: ProjectConfigOptions["workerMode"] = 
  (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") ?? "shared";

const SHOULD_DISABLE_ADMIN = process.env.DISABLE_ADMIN === "true";
const REDIS_URL = "redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379";

const medusaConfig = {
  projectConfig: {
    databaseUrl: "postgres://postgres:Omer1234@5.161.64.194:5432/medusa-medusa-store",
    databaseDriverOptions: SSL_CONFIG,
    databaseLogging: true,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,

    http: {
      adminCors: "http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://adminmedusa.omerzirh.com",
      authCors: "http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://adminmedusa.omerzirh.com",
      storeCors: "http://localhost:8000,https://docs.medusajs.com,store.omerzirh.com",
      jwtSecret: "supersecret",
      cookieSecret: "supersecret",
    },
  },
  admin: {
    backendUrl: "https://adminmedusa.omerzirh.com",
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: `${REDIS_URL}/static`,
            },
          },
        ],
      },
    },
    {
      key: Modules.EVENT_BUS,
      resolve: "@medusajs/event-bus-redis",
      options: {
        redisUrl: REDIS_URL,
      },
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: "@medusajs/workflow-engine-redis",
      options: {
        redis: {
          url: REDIS_URL,
        },
      },
    },
  ],
  plugins: [],
};

export default defineConfig(medusaConfig);