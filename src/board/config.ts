import validator from "../validator";

export enum BOARD_PROVIDER {
  REDIS = "redis",
}
export interface IBrokerConfigs {
  provider: BOARD_PROVIDER;
  redis: string[];
}

const config: IBrokerConfigs = {
  provider: (process.env.BOARD_PROVIDER ||
    BOARD_PROVIDER.REDIS) as BOARD_PROVIDER,
  redis: process.env.BOARD_REDIS_NODES?.split(",") || [],
};

const schema = {
  type: "object",
  properties: {
    provider: {
      type: "string",
      enum: Object.values(BOARD_PROVIDER),
    },
    redis: {
      type: "array",
      items: {
        type: "string",
        format: "uri",
      },
    },
  },
  required: ["provider", "redis"],
  additionalProperties: false,
};

const validate = validator.compile(schema);
if (!validate(config)) {
  throw new Error(`BOARD.CONFIG.ERR ${JSON.stringify(validate.errors)}`);
}

export default config;
