import { createGame } from "./apps/game/createGame";

const game = createGame("app");
if (import.meta.env.DEV) {
  (window as unknown as { game: typeof game }).game = game;
}
