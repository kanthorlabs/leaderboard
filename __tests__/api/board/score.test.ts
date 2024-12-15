import Redis from "ioredis";
import {
  IBoardScoreAUserInput,
  IBoardScoreAUserOutput,
  useScoreAUser,
} from "../../../src/api/board/score";
import { jest } from "@jest/globals";
import RedisBoard from "../../../src/board/redis";
import { BOARD_PROVIDER } from "../../../src/board";
import { ValidationError } from "../../../src/errors";

describe("useScoreAUser", () => {
  let redisBoard: RedisBoard;
  let client: Redis;
  let scoreAUser: (
    score: IBoardScoreAUserInput
  ) => Promise<IBoardScoreAUserOutput>;

  beforeEach(() => {
    client = new Redis();
    redisBoard = new RedisBoard({
      provider: BOARD_PROVIDER.REDIS,
      redis: client,
    });
    scoreAUser = useScoreAUser(redisBoard);
  });

  afterEach(() => {
    jest.clearAllMocks();
    client.quit();
  });

  it("should call board.score and return the result", async () => {
    const board = "board_test";
    const username = "user_test";
    const score = 10;

    const output: IBoardScoreAUserOutput = {
      board,
      username,
      score,
    };
    jest.spyOn(redisBoard, "score").mockResolvedValue(score);

    const result = await scoreAUser({ board, username, score });
    expect(result).toEqual(output);
    expect(redisBoard.score).toHaveBeenCalledWith(board, username, score);
  });

  it("should throw ValidationError if the input is invalid", async () => {
    const board = "board_test";
    const username = "user_test";
    const score = 0;

    await expect(scoreAUser({ board, username, score })).rejects.toThrow(
      "Invalid request payload format"
    );
  });
});
