// src/types/messages.ts

export type ClientMessage =
  | { type: "join"; name: string; roomId: string }
  | { type: "start-game"; roomId: string }
  | { type: "show-own-number"; roomId: string }
  | { type: "reset-game"; roomId: string };

export type ServerMessage =
  | { type: "connected" }
  | { type: "assigned"; playerId: string }
  | {
      type: "set-players";
      roomId: string;
      players: { name: string; playerId: string }[];
    }
  | { type: "start-game"; number: number }
  | { type: "show-own-number"; canSee: Record<string, number> }
  | { type: "reset-game" }
  | { type: "game-already-started" };
