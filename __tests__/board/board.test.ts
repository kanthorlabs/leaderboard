import Redis from "ioredis";
import Board, { BOARD_PROVIDER } from "../../src/board";

describe("Board", () => {
  let redis: Redis;

  beforeAll(() => {
    redis = new Redis({
      host: "localhost",
      port: 6379,
    });
  });
  afterAll(() => {
    jest.clearAllMocks();
    redis.quit();
  });

  it("should throw an error for unknown broker provider", () => {
    expect(() => {
      new Board({
        provider: "unknown" as BOARD_PROVIDER,
        redis,
      });
    }).toThrow("Unknown board provider: unknown");
  });

  it("should throw an error if the ready method fails", async () => {
    const board = new Board({
      provider: BOARD_PROVIDER.REDIS,
      redis,
    });

    jest.spyOn(redis, "ping").mockRejectedValue(new Error("Ping failed"));
    await expect(board.ready()).rejects.toThrow("Ping failed");
  });

  it("should throw an error if the live method fails", async () => {
    const board = new Board({
      provider: BOARD_PROVIDER.REDIS,
      redis,
    });

    jest.spyOn(redis, "ping").mockRejectedValue(new Error("Ping failed"));
    await expect(board.live()).rejects.toThrow("Ping failed");
  });

  it("should call board.score and return the result", async () => {
    const board = new Board({
      provider: BOARD_PROVIDER.REDIS,
      redis,
    });
    const score = jest.fn().mockResolvedValue(10);
    jest.spyOn(redis, "zincrby").mockImplementation(score);

    const result = await board.score("board_test", "user_test", 10);
    expect(result).toBe(10);
    expect(redis.zincrby).toHaveBeenCalledWith("board_test", 10, "user_test");
  });

  it("should call board.top and return the result", async () => {
    const board = new Board({
      provider: BOARD_PROVIDER.REDIS,
      redis,
    });
    const scores = ["user1", "100", "user2", "90", "user3", "80"];
    jest.spyOn(redis, "zrevrange").mockResolvedValue(scores);

    const result = await board.top("board_test", 10);
    expect(result).toEqual([
      { username: "user1", score: 100, rank: 1 },
      { username: "user2", score: 90, rank: 2 },
      { username: "user3", score: 80, rank: 3 },
    ]);
    expect(redis.zrevrange).toHaveBeenCalledWith(
      "board_test",
      0,
      9,
      "WITHSCORES"
    );
  });

  it("should call board.me and return the result", async () => {
    const board = new Board({
      provider: BOARD_PROVIDER.REDIS,
      redis,
    });
    const rank = 1;
    const score = "100";

    jest.spyOn(redis, "zrevrank").mockResolvedValue(rank);
    jest.spyOn(redis, "zscore").mockResolvedValue(score);

    const result = await board.me("board_test", "user_test");
    expect(result).toEqual({ username: "user_test", score: 100, rank: 1 });
    expect(redis.zrevrank).toHaveBeenCalledWith("board_test", "user_test");
    expect(redis.zscore).toHaveBeenCalledWith("board_test", "user_test");
  });
});
