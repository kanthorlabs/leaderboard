import "dotenv/config";
import { createServer } from "node:http";
import Redis from "ioredis";

import logger from "./logger";
import { create as createBoard } from "./board";
import { create as createBroker } from "./broker";
import * as api from "./api";
import * as websocket from "./websocket";

async function main() {
  const board = await createBoard();
  const broker = await createBroker();

  const server = createServer(await api.create(board, broker));
  const ws = await websocket.create(server, board, broker);

  // gracefully shutdown
  process.once("SIGINT", shutdown.bind(null, { signal: "SIGINT" })); // Triggered by Ctrl+C
  process.once("SIGTERM", shutdown.bind(null, { signal: "SIGTERM" })); // Triggered by termination signals
  process.on("uncaughtException", (err) => {
    logger.error(`MAIN.UNCAUGHT_EXCEPTION: ${err}`);
    shutdown({ signal: "uncaughtException" });
  });
  process.on("unhandledRejection", (err) => {
    logger.error(`MAIN.UNHANDLED_REJECTION: ${err}`);
    shutdown({ signal: "unhandledRejection" });
  });

  async function shutdown(args: any) {
    logger.warn({ ...args }, "Shutting down...");
    await new Promise((resolve) =>
      server.close((err) => {
        if (err) logger.error(`MAIN.HTTP.CLOSE.ERR: ${err?.message}`);
        resolve(null);
      })
    );

    await ws.close().catch((err) => {
      logger.error(`MAIN.WS.CLOSE.ERR: ${err.message}`);
    });
    await broker.stop().catch((err) => {
      logger.error(`MAIN.BROKER.CLOSE.ERR: ${err.message}`);
    });
    await board.stop().catch((err) => {
      logger.error(`MAIN.BOARD.CLOSE.ERR: ${err.message}`);
    });

    // wait a little bit before exiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
    logger.info("Byee");
    process.exit(0);
  }

  Promise.all([board.start(), broker.start()]).then(() => {
    const PORT = process.env.PORT || 8080;
    server.listen(PORT, () => {
      logger.info(`HTTP+WS: ${PORT}`);
    });
  });
}

main();
