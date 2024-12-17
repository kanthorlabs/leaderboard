import uptrace from "@uptrace/node";

import conf from "./config";
uptrace.configureOpentelemetry({
  dsn: conf.otel.dsn,
  serviceName: "leaderboard",
  serviceVersion: "1.0.0",
  deploymentEnvironment: process.env.NODE_ENV || "development",
});
