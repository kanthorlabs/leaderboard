import Redis, { Cluster } from "ioredis";
import * as redisProvider from "../providers/redis";
import RedisBoard from "./redis";
import conf, { BOARD_PROVIDER } from "./config";

export interface IBoardRank {
  username: string;
  score: number;
  rank: number;
}

export interface IBoard {
  start(): Promise<void>;
  stop(): Promise<void>;
  ready(): Promise<void>;
  live(): Promise<void>;

  score(board: string, username: string, scores: number): Promise<number>;
  top(board: string, count: number): Promise<IBoardRank[]>;
  me(board: string, username: string): Promise<IBoardRank>;
}

export interface IBoardOptions {
  provider: BOARD_PROVIDER;
  redis: Redis | Cluster;
}

// Design Pattern: Factory, Proxy
export default class Board implements IBoard {
  private board: IBoard;

  constructor(options: IBoardOptions) {
    if (options.provider === BOARD_PROVIDER.REDIS) {
      this.board = new RedisBoard(options);
      return;
    }

    throw new Error(`Unknown board provider: ${options.provider}`);
  }

  async start(): Promise<void> {
    await this.board.start();
  }

  async stop(): Promise<void> {
    await this.board.stop();
  }

  async ready(): Promise<void> {
    await this.board.ready();
  }

  async live(): Promise<void> {
    await this.board.live();
  }

  async score(
    board: string,
    username: string,
    scores: number
  ): Promise<number> {
    return this.board.score(board, username, scores);
  }

  async top(board: string, count: number): Promise<IBoardRank[]> {
    return this.board.top(board, count);
  }

  async me(board: string, username: string): Promise<IBoardRank> {
    return this.board.me(board, username);
  }
}

export function create() {
  return new Board({
    provider: conf.provider,
    redis: redisProvider.create(conf.redis),
  });
}
