import { IBoard } from "../../board";
import * as scoreActions from "./score";

export default function useBoardActions(board: IBoard) {
  return {
    score: scoreActions.useScoreAUser(board),
  };
}
