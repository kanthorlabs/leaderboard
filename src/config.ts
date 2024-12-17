import validator from "./validator";

export interface IBrokerConfigs {
  otel: {
    dsn: string;
  };
}

const config: IBrokerConfigs = {
  otel: {
    dsn: process.env.OTEL_DSN || "",
  },
};

const schema = {
  type: "object",
  properties: {
    otel: {
      type: "object",
      properties: {
        dsn: {
          type: "string",
        },
      },
      required: ["dsn"],
      additionalProperties: false,
    },
  },
  required: ["otel"],
  additionalProperties: false,
};

const validate = validator.compile(schema);
if (!validate(config)) {
  throw new Error(`APP.CONFIG.ERR ${JSON.stringify(validate.errors)}`);
}

export default config;
