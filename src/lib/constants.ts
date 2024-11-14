import { ProjectConfigOptions } from "@medusajs/framework";
import { loadEnv } from "@medusajs/framework/utils";
import { assertValue } from "src/utils/assert-value";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

/**
 * Is development environment
 */
export const IS_DEV = process.env.NODE_ENV === "development";

/**
 * Public URL for the backend
 */


/**
 * Database URL for Postgres instance used by the backend
 */

/**
 * (optional) Redis URL for Redis instance used by the backend
 */

/**
 * Admin CORS origins
 */
export const ADMIN_CORS = assertValue(
  process.env.ADMIN_CORS,
  "Environment variable for ADMIN_CORS is not set",
);

/**
 * Auth CORS origins
 */


/**
 * JWT Secret used for signing JWT tokens


/**
 * (optional) Resend API Key and from Email - do not set if using SendGrid
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const RESEND_FROM_EMAIL = process.env.RESEND_FROM;

/**
 * SSL configuration
 */
export const SSL_CONFIG =
  process.env.NODE_ENV === "production"
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : { ssl: false };

/**
 * Worker mode
 */
export const WORKER_MODE =
  (process.env.MEDUSA_WORKER_MODE as ProjectConfigOptions["workerMode"]) ??
  "shared";

/**
 * Disable Admin
 */
export const SHOULD_DISABLE_ADMIN = process.env.DISABLE_ADMIN === "true";
