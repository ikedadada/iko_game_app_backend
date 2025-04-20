import { MiddlewareHandler } from "hono";
import winston, { Logger } from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export const logMiddleware = (l: Logger = logger): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    const method = c.req.method;
    const url = c.req.url;
    const status = c.res.status;

    l.info({
      method,
      url,
      type: "request",
      status,
      duration,
    });
  };
};
