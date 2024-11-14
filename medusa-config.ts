import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils";
import { SHOULD_DISABLE_ADMIN, SSL_CONFIG, WORKER_MODE } from "src/lib/constants";

loadEnv(process.env.NODE_ENV, process.cwd());

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
    // Fix for TypeScript error by removing the truthy check
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
  plugins: [
    // 'medusa-fulfillment-manual'
  ],
};

export default defineConfig(medusaConfig);