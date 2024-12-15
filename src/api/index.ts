import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { IBoard } from "../board";
import { IBroker } from "../broker";
import useBoardActions from "./board";
import { LEADERBOARD } from "../events";

export function create(board: IBoard, broker: IBroker) {
  const boardActions = useBoardActions(board);

  const server = express();
  server.use(cors());
  server.use(json());

  server.use(express.static("public"));

  server.get("/readiness", async (req, res) => {
    await Promise.all([broker.ready(), board.ready()]);
    res.send("ready");
  });

  server.get("/liveness", async (req, res) => {
    await Promise.all([broker.live(), board.live()]);
    res.send("live");
  });

  server.post("/board/:board", async function score(req, res): Promise<any> {
    const output = await boardActions.score({
      board: req.params.board,
      username: req.body.username,
      score: req.body.score,
    });

    await broker.pub(output.board, output.username);
    return res.json(output);
  });

  server.use((req, res) => {
    res.status(404).send("Not Found");
  });

  return server;
}
