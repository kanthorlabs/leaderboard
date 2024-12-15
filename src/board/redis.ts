import Redis, { Cluster } from "ioredis";
import { IBoardOptions, IBoard, IBoardRank } from ".";

export default class RedisBoard implements IBoard {
  private readonly client: Redis | Cluster;

  constructor(private options: IBoardOptions) {
    this.client = options.redis;
  }

  async ready(): Promise<void> {
    await this.client.ping();
  }

  async live(): Promise<void> {
    await this.client.ping();
  }

  async score(
    board: string,
    username: string,
    scores: number
  ): Promise<number> {
    const newScores = await this.client.zincrby(board, scores, username);
    return Number(newScores);
  }

  async top(board: string, count: number): Promise<IBoardRank[]> {
    const scores = await this.client.zrevrange(
      board,
      0,
      count - 1,
      "WITHSCORES"
    );
    const rank: IBoardRank[] = [];
    for (let i = 0; i < scores.length / 2; i++) {
      rank.push({
        username: scores[i * 2],
        score: Number(scores[i * 2 + 1]),
        rank: i + 1,
      });
    }
    return rank;
  }

  async me(board: string, username: string): Promise<IBoardRank> {
    const rank = await this.client.zrevrank(board, username);
    const score = await this.client.zscore(board, username);
    return { username, score: Number(score), rank: Number(rank) };
  }
}
