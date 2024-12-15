import { createServer } from "node:http";

import Board, { BOARD_PROVIDER } from "./board";
import Broker, { BROKER_PROVIDER } from "./broker";
import * as api from "./api";
import * as websocket from "./websocket";
import Redis from "ioredis";

const board = new Board({
  provider: BOARD_PROVIDER.REDIS,
  redis: new Redis({
    host: "localhost",
    port: 6379,
  }),
});
const broker = new Broker({
  provider: BROKER_PROVIDER.REDIS,
  subscriber: new Redis({
    host: "localhost",
    port: 6379,
  }),
  publisher: new Redis({
    host: "localhost",
    port: 6379,
  }),
});

const server = createServer(api.create(board, broker));
websocket.create(server, board, broker);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
