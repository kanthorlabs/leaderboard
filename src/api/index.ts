import express from "express";
import cors from "cors";
import { json } from "body-parser";
import { IBoard } from "../board";
import { IBroker } from "../broker";
import useBoardActions from "./board";
import conf from "./config";

export async function create(board: IBoard, broker: IBroker) {
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

  // Simulate authentication, not be used in PRODUCTION
  // Auth/Authz should be done in API Gateway
  server.use((req, res, next) => {
    const key = req.query._api_key || req.headers["api-key"];
    if (!key || key !== conf.auth.key) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    next();
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
