import Redis, { Cluster } from "ioredis";
import { IBroker, IBrokerOptions } from ".";

export default class RedisBroker implements IBroker {
  private readonly publisher: Redis | Cluster;

  private readonly subscriber: Redis | Cluster;

  constructor(private options: IBrokerOptions) {
    this.publisher = options.publisher;
    this.subscriber = options.subscriber;
  }

  async start(): Promise<void> {
    if (this.publisher.status !== "ready") {
      await this.publisher.connect();
    }

    if (this.subscriber.status !== "ready") {
      await this.subscriber.connect();
    }
  }

  async stop(): Promise<void> {
    if (this.publisher.status === "ready") {
      await this.publisher.quit();
    }
    if (this.subscriber.status === "ready") {
      await this.subscriber.quit();
    }
  }

  async ready(): Promise<void> {
    await Promise.all([this.subscriber.ping(), this.publisher.ping()]);
  }

  async live(): Promise<void> {
    await Promise.all([this.subscriber.ping(), this.publisher.ping()]);
  }

  async pub(channel: string, message: string): Promise<void> {
    await this.publisher.publish(channel, message);
  }

  async sub(target: string, handler: (message: string) => void): Promise<void> {
    await new Promise((resolve, reject) => {
      this.subscriber.subscribe(target, (err: any, count: any) => {
        if (err) return reject(err);
        return resolve(count);
      });
    });

    this.subscriber.on("message", async (channel, message) => {
      if (channel === target) handler(message);
    });
  }

  async unsub(channel: string): Promise<number> {
    const remaining = await this.subscriber.unsubscribe(channel);
    return Number(remaining);
  }
}
