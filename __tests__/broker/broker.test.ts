import Redis from "ioredis";
import Broker from "../../src/broker";
import { BROKER_PROVIDER } from "../../src/broker/config";

describe("Broker", () => {
  let publisher: Redis;
  let subscriber: Redis;

  beforeAll(() => {
    publisher = new Redis({
      host: "localhost",
      port: 6379,
    });
    subscriber = new Redis({
      host: "localhost",
      port: 6379,
    });
  });
  afterAll(() => {
    jest.clearAllMocks();
    publisher.quit();
    subscriber.quit();
  });

  beforeEach(() => {
    publisher.status = "connecting";
    subscriber.status = "connecting";
  });

  it("should be a class", () => {
    expect(typeof Broker).toBe("function");
    expect(Broker.prototype.constructor).toBe(Broker);
  });

  it("should be start ok", async () => {
    const broker = new Broker({
      provider: BROKER_PROVIDER.REDIS,
      publisher,
      subscriber,
    });

    jest.spyOn(publisher, "connect").mockResolvedValue();
    jest.spyOn(subscriber, "connect").mockResolvedValue();
    await expect(broker.start()).resolves.toBeUndefined();
  });

  it("should be ok to be stopped", async () => {
    const broker = new Broker({
      provider: BROKER_PROVIDER.REDIS,
      publisher,
      subscriber,
    });

    publisher.status = "ready";
    subscriber.status = "ready";

    jest.spyOn(publisher, "quit").mockResolvedValue("OK");
    jest.spyOn(subscriber, "quit").mockResolvedValue("OK");
    await expect(broker.stop()).resolves.toBeUndefined();
  });

  it("should throw an error for unknown broker provider", () => {
    expect(() => {
      new Broker({
        provider: "unknown" as BROKER_PROVIDER,
        publisher,
        subscriber,
      });
    }).toThrow("Unknown broker provider: unknown");
  });

  it("should throw an error if the ready method fails", async () => {
    const board = new Broker({
      provider: BROKER_PROVIDER.REDIS,
      publisher,
      subscriber,
    });

    jest.spyOn(publisher, "ping").mockRejectedValue(new Error("Ping failed"));
    await expect(board.ready()).rejects.toThrow("Ping failed");
  });

  it("should throw an error if the live method fails", async () => {
    const board = new Broker({
      provider: BROKER_PROVIDER.REDIS,
      publisher,
      subscriber,
    });

    jest.spyOn(publisher, "ping").mockRejectedValue(new Error("Ping failed"));
    await expect(board.live()).rejects.toThrow("Ping failed");
  });

  describe("pub", () => {
    it("should publish the given message to the given channel", async () => {
      const channel = "channel_test";
      const message = "message_test";

      const publishSpy = jest.spyOn(publisher, "publish");
      const board = new Broker({
        provider: BROKER_PROVIDER.REDIS,
        publisher,
        subscriber,
      });
      await board.pub(channel, message);
      expect(publishSpy).toHaveBeenCalledWith(channel, message);
    });
  });

  describe("sub", () => {
    it("should subscribe to the given channel and execute the given handler", async () => {
      const channel = "channel_test";

      const board = new Broker({
        provider: BROKER_PROVIDER.REDIS,
        publisher,
        subscriber,
      });

      const subscribeSpy = jest
        .spyOn((board as any).broker, "sub")
        .mockResolvedValue(null);

      const handler = jest.fn();
      await board.sub(channel, handler);

      expect(subscribeSpy).toHaveBeenCalledWith(channel, expect.any(Function));
    });
  });

  describe("unsub", () => {
    it("should unsubscribe from the given channel", async () => {
      const channel = "channel_test";

      const board = new Broker({
        provider: BROKER_PROVIDER.REDIS,
        publisher,
        subscriber,
      });

      const unsubscribeSpy = jest
        .spyOn((board as any).broker, "unsub")
        .mockResolvedValue(null);

      await board.unsub(channel);
      expect(unsubscribeSpy).toHaveBeenCalledWith(channel);
    });
  });
});
