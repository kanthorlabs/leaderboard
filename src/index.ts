import "dotenv/config";
import { createServer } from "node:http";
import Redis from "ioredis";

import logger from "./logger";
import { create as createBoard } from "./board";
import { create as createBroker } from "./broker";
import * as api from "./api";
import * as websocket from "./websocket";

const board = createBoard();
const broker = createBroker();

const server = createServer(api.create(board, broker));
const ws = websocket.create(server, board, broker);

// gracefully shutdown
process.on("SIGINT", shutdown); // Triggered by Ctrl+C
process.on("SIGTERM", shutdown); // Triggered by termination signals
process.on("uncaughtException", shutdown);
process.on("unhandledRejection", shutdown);

async function shutdown() {
  logger.warn("Shutting down...");
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
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    logger.info(`HTTP+WS: ${PORT}`);
  });
});
