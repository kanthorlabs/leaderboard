import Redis from "ioredis";
import RedisBroker from "../../src/broker/redis";
import { BROKER_PROVIDER } from "../../src/broker";

describe("RedisBroker", () => {
  let publisher: Redis;
  let subscriber: Redis;
  let broker: RedisBroker;

  beforeAll(() => {
    publisher = new Redis({
      host: "localhost",
      port: 6379,
    });
    subscriber = new Redis({
      host: "localhost",
      port: 6379,
    });
    broker = new RedisBroker({
      provider: BROKER_PROVIDER.REDIS,
      publisher,
      subscriber,
    });
  });

  afterAll(() => {
    jest.clearAllMocks();
    publisher.quit();
    subscriber.quit();
  });

  describe("ready", () => {
    it("should ping the Redis publisher and subscriber and resolve the promise", async () => {
      jest.spyOn(publisher, "ping").mockResolvedValueOnce("PONG");
      jest.spyOn(subscriber, "ping").mockResolvedValueOnce("PONG");

      await expect(broker.ready()).resolves.not.toThrow();
    });

    it("should reject the promise if the ping fails for the publisher", async () => {
      jest.spyOn(publisher, "ping").mockRejectedValue(new Error("Ping failed"));
      await expect(broker.ready()).rejects.toThrow("Ping failed");
    });

    it("should reject the promise if the ping fails for the subscriber", async () => {
      jest.spyOn(publisher, "ping").mockResolvedValueOnce("PONG");

      jest
        .spyOn(subscriber, "ping")
        .mockRejectedValue(new Error("Ping failed"));
      await expect(broker.ready()).rejects.toThrow("Ping failed");
    });
  });

  describe("live", () => {
    it("should ping the Redis publisher and subscriber and resolve the promise", async () => {
      jest.spyOn(publisher, "ping").mockResolvedValueOnce("PONG");
      jest.spyOn(subscriber, "ping").mockResolvedValueOnce("PONG");

      await expect(broker.live()).resolves.not.toThrow();
    });

    it("should reject the promise if the ping fails for the publisher", async () => {
      jest.spyOn(publisher, "ping").mockRejectedValue(new Error("Ping failed"));
      await expect(broker.live()).rejects.toThrow("Ping failed");
    });

    it("should reject the promise if the ping fails for the subscriber", async () => {
      jest.spyOn(publisher, "ping").mockResolvedValueOnce("PONG");

      jest
        .spyOn(subscriber, "ping")
        .mockRejectedValue(new Error("Ping failed"));
      await expect(broker.live()).rejects.toThrow("Ping failed");
    });
  });

  describe("pub", () => {
    it("should publish the given message to the given channel", async () => {
      const channel = "test-channel";
      const message = "test-message";

      const publishSpy = jest.spyOn(publisher, "publish");
      await broker.pub(channel, message);
      expect(publishSpy).toHaveBeenCalledWith(channel, message);
    });
  });

  describe("sub", () => {
    it("should subscribe to the given channel and execute the given handler", async () => {
      const channel = "test-channel";
      const message = "test-message";

      const subscribeSpy = jest.spyOn(subscriber, "subscribe");

      const handler = jest.fn();
      await broker.sub(channel, handler);

      expect(subscribeSpy).toHaveBeenCalledWith(channel, expect.any(Function));
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("unsub", () => {
    it("should unsubscribe from the given channel", async () => {
      const channel = "test-channel";

      await broker.sub(channel, () => {});
      const unsubscribeSpy = jest.spyOn(subscriber, "unsubscribe");
      await broker.unsub(channel);
      expect(unsubscribeSpy).toHaveBeenCalledWith(channel);
    });
  });
});
