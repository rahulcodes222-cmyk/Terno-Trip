import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config/env.js";

/**
 * createServiceProxy
 *
 * @param targetUrl  - downstream service base URL (e.g. http://localhost:4001)
 * @param pathPrefix - the path prefix that was stripped by Express router.use()
 *                     e.g. "/api/v1/auth" → we must write it back so the
 *                     downstream service receives the full path it expects.
 */
export function createServiceProxy(targetUrl: string, pathPrefix: string) {
  return createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    // Express router.use("/api/v1/auth") strips "/api/v1/auth" before the
    // proxy sees the URL. We prepend it back so the downstream service
    // receives the full path it registered (e.g. /api/v1/auth/me).
    pathRewrite: (path) => `${pathPrefix}${path}`,
    on: {
      proxyReq: (proxyReq, req: any) => {
        if (req.user?.id)      proxyReq.setHeader("x-user-id",           req.user.id);
        if (req.user?.role)    proxyReq.setHeader("x-user-role",         req.user.role);
        proxyReq.setHeader("x-internal-secret", env.INTERNAL_SERVICE_SECRET);
        if (req.correlationId) proxyReq.setHeader("x-correlation-id",    req.correlationId);
      },
      error: (_err, _req, res: any) => {
        res.status(503).json({
          success: false,
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Service temporarily unavailable",
          },
        });
      },
    },
  });
}
