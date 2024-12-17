import validator from "../validator";

export interface IBrokerConfigs {
  auth: {
    key: string;
  };
}

const config: IBrokerConfigs = {
  auth: {
    key: process.env.API_AUTH_KEY || "changemenow",
  },
};

const schema = {
  type: "object",
  properties: {
    auth: {
      type: "object",
      properties: {
        key: {
          type: "string",
        },
      },
      required: ["key"],
      additionalProperties: false,
    },
  },
  required: ["auth"],
  additionalProperties: false,
};

const validate = validator.compile(schema);
if (!validate(config)) {
  throw new Error(`API.CONFIG.ERR ${JSON.stringify(validate.errors)}`);
}

export default config;
