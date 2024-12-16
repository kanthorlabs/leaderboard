import validator from "../validator";

export interface IWebSocketConfigs extends IWebSocketBackplaneConfig {}

export interface IWebSocketBackplaneConfig {
  baclplane: {
    redis: string[];
  };
}

const config: IWebSocketConfigs = {
  baclplane: {
    redis: process.env.WEBSOCKET_BACKPLANE_REDIS_NODES?.split(",") || [],
  },
};

const schema = {
  type: "object",
  properties: {
    baclplane: {
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
  required: ["baclplane"],
  additionalProperties: false,
};

const validate = validator.compile(schema);
if (!validate(config)) {
  throw new Error(`WEBSOCKET.CONFIG.ERR ${JSON.stringify(validate.errors)}`);
}

export default config;
