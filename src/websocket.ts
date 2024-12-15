import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createShardedAdapter } from "@socket.io/redis-adapter";
import { IBoard } from "./board";
import { IBroker } from "./broker";
import { LEADERBOARD } from "./events";

export function create(server: any, board: IBoard, broker: IBroker) {
  const redispub = new Redis();
  const redissub = new Redis();

  const io = new Server(server, {
    adapter: createShardedAdapter(redispub, redissub),
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
