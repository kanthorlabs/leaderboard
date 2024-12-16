import validator, { ValidationError } from "../../validator";

import { IBoard } from "../../board";

const schema = {
  type: "object",
  properties: {
    board: {
      type: "string",
      pattern: "^[a-zA-Z0-9_]{1,32}$",
      description:
        "Identifier for the leaderboard, alphanumeric, 1-32 characters",
    },
    username: {
      type: "string",
      pattern: "^[a-zA-Z0-9_]{1,26}$",
      description:
        "Unique identifier for the user, alphanumeric, 26 characters",
    },
    score: {
      type: "integer",
      minimum: 1,
      maximum: 1000000,
      description: "Score achieved by the user, must be a non-negative integer",
    },
  },
  required: ["username", "score"],
  additionalProperties: false,
};
const validate = validator.compile(schema);

export interface IBoardScoreAUserInput {
  board: string;
  username: string;
  score: number;
}

export interface IBoardScoreAUserOutput {
  board: string;
  username: string;
  score: number;
}

export function useScoreAUser(board: IBoard) {
  return async function scoreUser(score: IBoardScoreAUserInput) {
    if (!validate(score)) {
      throw new ValidationError(
        "Invalid request payload format",
        validate.errors
      );
    }

    const output: IBoardScoreAUserOutput = {
      board: score.board,
      username: score.username,
      score: await board.score(score.board, score.username, score.score),
    };
    return output;
  };
}
