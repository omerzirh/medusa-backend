import { defineConfig, loadEnv, Modules } from "@medusajs/framework/utils";
import { SHOULD_DISABLE_ADMIN, SSL_CONFIG, WORKER_MODE } from "src/lib/constants";


loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: "postgres://postgres:Omer1234@5.161.64.194:5432/medusa-medusa-store",
    databaseDriverOptions: SSL_CONFIG,
    databaseLogging: true,
    redisUrl: "redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379",
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
              backend_url: `${"redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379"}/static`,
            },
          },
        ],
      },
    },
    ...("redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379"
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: "redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379",
            },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                url: "redis://:uOnV9g2MYYcQUHUuDyEKLcmNmOkPzqreMSz2zFjvDgWkIQUqRK8AwSxbAwppDLxD@5.161.64.194:6379",
              },
            },
          },
        ]
      : []),
  ],
  plugins: [
    // 'medusa-fulfillment-manual'
  ],
};

// console.log(JSON.stringify(medusaConfig, null, 2));
export default defineConfig(medusaConfig);
