import pino from "pino";

export default pino({
  level: process.env.LOGGGER_LEVEL || "info",
  serializers: {
    err: pino.stdSerializers.err,
  },
});
