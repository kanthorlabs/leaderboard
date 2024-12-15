import Redis, { Cluster } from "ioredis";
import RedisBroker from "./redis";

export interface IBroker {
  ready(): Promise<void>;
  live(): Promise<void>;

  pub(channel: string, message: string): Promise<void>;
  sub(channel: string, handler: (message: string) => void): Promise<void>;
  unsub(channel: string): Promise<number>;
}

export enum BROKER_PROVIDER {
  REDIS = "redis",
}
export interface IBrokerOptions {
  provider: BROKER_PROVIDER;
  publisher: Redis | Cluster;
  subscriber: Redis | Cluster;
}

// Design Pattern: Factory, Proxy
export default class Broker implements IBroker {
  private readonly broker: IBroker;

  constructor(private options: IBrokerOptions) {
    if (options.provider === BROKER_PROVIDER.REDIS) {
      this.broker = new RedisBroker(options);
      return;
    }
    throw new Error(`Unknown broker provider: ${options.provider}`);
  }

  async ready(): Promise<void> {
    await this.broker.ready();
  }

  async live(): Promise<void> {
    await this.broker.live();
  }

  pub(channel: string, message: string): Promise<void> {
    return this.broker.pub(channel, message);
  }

  sub(channel: string, handler: (message: string) => void): Promise<void> {
    return this.broker.sub(channel, handler);
  }

  unsub(channel: string): Promise<number> {
    return this.broker.unsub(channel);
  }
}
