import { Server } from "socket.io";
import { createShardedAdapter } from "@socket.io/redis-adapter";
import * as redisProvider from "../providers/redis";
import { IBoard } from "../board";
import { IBroker } from "../broker";
import { LEADERBOARD } from "../events";
import conf from "./config";

export async function create(server: any, board: IBoard, broker: IBroker) {
  const client = await redisProvider.create(conf.baclplane.redis);

  const io = new Server(server, {
    adapter: createShardedAdapter(client, client.duplicate()),
  });

  // Set up Socket.io connection event
  io.of(/^\/board-[a-zA-Z0-9_]+$/).on("connection", (socket) => {
    const boardName = socket.nsp.name.replace("/board-", "");
    const count = Number(socket.handshake.query.top_count) || 10;

    socket.on(LEADERBOARD.SUBSCRIBED, async () => {
      const top = await board.top(boardName, count);
      socket.emit(LEADERBOARD.UPDATED, { top });
    });

    broker.sub(boardName, async (username: string) => {
      const top = await board.top(boardName, count);
      socket.emit(LEADERBOARD.UPDATED, { top });
    });

    // Handle disconnection
    socket.on("disconnect", async () => {
      await broker.unsub(boardName);
    });
  });

  return io;
}
