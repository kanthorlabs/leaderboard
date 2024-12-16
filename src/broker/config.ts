import validator from "../validator";

export enum BROKER_PROVIDER {
  REDIS = "redis",
}
export interface IBrokerConfigs
  extends IBrokerPublisherConfig,
    IBrokerSubscriberConfig {
  provider: BROKER_PROVIDER;
}

export interface IBrokerPublisherConfig {
  publisher: {
    redis: string[];
  };
}
export interface IBrokerSubscriberConfig {
  subscriber: {
    redis: string[];
  };
}

const config: IBrokerConfigs = {
  provider: (process.env.BROKER_PROVIDER ||
    BROKER_PROVIDER.REDIS) as BROKER_PROVIDER,
  subscriber: {
    redis: process.env.BROKER_PUBLISHER_REDIS_NODES?.split(",") || [],
  },
  publisher: {
    redis: process.env.BROKER_SUBSCRIBER_REDIS_NODES?.split(",") || [],
  },
};

const schema = {
  type: "object",
  properties: {
    provider: {
      type: "string",
      enum: Object.values(BROKER_PROVIDER),
    },
    publisher: {
      type: "object",
      properties: {
        redis: {
          type: "array",
          items: {
            type: "string",
            format: "uri",
          },
        },
      },
      required: ["redis"],
      additionalProperties: false,
    },
    subscriber: {
      type: "object",
      properties: {
        redis: {
          type: "array",
          items: {
            type: "string",
            format: "uri",
          },
        },
      },
      required: ["redis"],
      additionalProperties: false,
    },
  },
  required: ["provider", "publisher", "subscriber"],
  additionalProperties: false,
};

const validate = validator.compile(schema);
if (!validate(config)) {
  throw new Error(`BOARD.CONFIG.ERR ${JSON.stringify(validate.errors)}`);
}

export default config;
