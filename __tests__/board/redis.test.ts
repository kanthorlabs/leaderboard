// redis.test.ts
import Redis from "ioredis";
import RedisBoard from "../../src/board/redis";
import { BOARD_PROVIDER } from "../../src/board/config";

describe("RedisBoard", () => {
  let redisBoard: RedisBoard;
  let client: Redis;

  beforeEach(() => {
    client = new Redis();
    redisBoard = new RedisBoard({
      provider: BOARD_PROVIDER.REDIS,
      redis: client,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    client.quit();
  });

  describe("ready", () => {
    it("should ping the Redis client and resolve the promise", async () => {
      await expect(redisBoard.ready()).resolves.not.toThrow();
    });

    it("should reject the promise if the ping fails", async () => {
      jest.spyOn(client, "ping").mockRejectedValue(new Error("Ping failed"));
      await expect(redisBoard.ready()).rejects.toThrow("Ping failed");
    });
  });

  describe("live", () => {
    it("should ping the Redis client and resolve the promise", async () => {
      await expect(redisBoard.live()).resolves.not.toThrow();
    });

    it("should reject the promise if the ping fails", async () => {
      jest.spyOn(client, "ping").mockRejectedValue(new Error("Ping failed"));
      await expect(redisBoard.live()).rejects.toThrow("Ping failed");
    });
  });

  describe("score", () => {
    it("should increment the score for the given board and username", async () => {
      const board = "board_test";
      const username = "user_test";
      const score = 10;

      jest.spyOn(client, "zincrby").mockResolvedValue(score.toString());

      const result = await redisBoard.score(board, username, score);
      expect(result).toBe(score);
    });

    it("should reject the promise if the zincrby command fails", async () => {
      const board = "board_test";
      const username = "user_test";
      const score = 10;

      jest
        .spyOn(client, "zincrby")
        .mockRejectedValue(new Error("zincrby failed"));
      await expect(redisBoard.score(board, username, score)).rejects.toThrow(
        "zincrby failed"
      );
    });
  });

  describe("top", () => {
    it("should retrieve the top scores for the given board", async () => {
      const board = "board_test";
      const count = 10;

      const scores = ["user1", "100", "user2", "90", "user3", "80"];

      jest.spyOn(client, "zrevrange").mockResolvedValue(scores);

      const result = await redisBoard.top(board, count);
      expect(result).toEqual([
        { username: "user1", score: 100, rank: 1 },
        { username: "user2", score: 90, rank: 2 },
        { username: "user3", score: 80, rank: 3 },
      ]);
    });

    it("should reject the promise if the zrevrange command fails", async () => {
      const board = "board_test";
      const count = 10;

      jest
        .spyOn(client, "zrevrange")
        .mockRejectedValue(new Error("zrevrange failed"));
      await expect(redisBoard.top(board, count)).rejects.toThrow(
        "zrevrange failed"
      );
    });
  });

  describe("me", () => {
    it("should retrieve the rank and score for the given board and username", async () => {
      const board = "board_test";
      const username = "user_test";

      const rank = 1;
      const score = 100;

      jest.spyOn(client, "zrevrank").mockResolvedValue(rank);
      jest.spyOn(client, "zscore").mockResolvedValue(score.toString());

      const result = await redisBoard.me(board, username);
      expect(result).toEqual({ username, score, rank });
    });

    it("should reject the promise if the zrevrank or zscore command fails", async () => {
      const board = "board_test";
      const username = "user_test";

      jest
        .spyOn(client, "zrevrank")
        .mockRejectedValue(new Error("zrevrank failed"));
      await expect(redisBoard.me(board, username)).rejects.toThrow(
        "zrevrank failed"
      );

      jest.spyOn(client, "zrevrank").mockResolvedValue(null);
      jest
        .spyOn(client, "zscore")
        .mockRejectedValue(new Error("zscore failed"));
      await expect(redisBoard.me(board, username)).rejects.toThrow(
        "zscore failed"
      );
    });
  });
});
