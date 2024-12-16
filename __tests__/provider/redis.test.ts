import { Redis, Cluster } from "ioredis";
import { create } from "../../src/providers/redis";

describe("create", () => {
  it("should create a standalone Redis instance for a single node", async () => {
    const nodes = ["redis://localhost:6379"];
    const instance = await create(nodes);

    expect(instance).toBeInstanceOf(Redis);
    await instance.quit();
  });
});
