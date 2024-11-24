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
      adminCors: "http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://admin.autolier.pl",
      authCors: "http://localhost:5173,http://localhost:9000,https://docs.medusajs.com,https://admin.autolier.pl",
      storeCors: "http://localhost:8000,https://docs.medusajs.com,https://autolier.pl",
      jwtSecret: "supersecret",
      cookieSecret: "supersecret",
    },
  },
  admin: {
    serve: true,
    path: "/app" as `/${string}`,  // Type assertion to match required format
    backendUrl: "https://admin.autolier.pl",
    disable: SHOULD_DISABLE_ADMIN,
    port: 7001
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
    {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/notification-sendgrid",
            id: "sendgrid",
            options: {
              channels: ["email"],
              api_key: process.env.SENDGRID_API_KEY,
              from: process.env.SENDGRID_FROM,
              templates: {
                order_placed: "d-2246c3cba4494ce1b031547391dba6cc",
              },
            },
          },
        ],
      },
    },
    {
      key: Modules.PAYMENT,
      resolve: "@medusajs/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            options: {
              credentials: {
                usd: {
                  apiKey: process.env.STRIPE_API_KEY,
                },
              },
            },
          },
        ],
      },
    },
  ],
  plugins: [],
};

export default defineConfig(medusaConfig);