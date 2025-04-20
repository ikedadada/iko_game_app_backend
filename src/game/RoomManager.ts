import { Room } from "./Room.js";
import { Player } from "./Player.js";
import { logger } from "../utils/logger.js";

export class RoomManager {
  private rooms = new Map<string, Room>();

  joinRoom(roomId: string, name: string, ws: WebSocket) {
    logger.info({
      type: "websocket",
      message: `Player ${name} joined room ${roomId}`,
      roomId,
      playerName: name,
    });
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    const room = this.rooms.get(roomId)!;
    room.addPlayer(name, ws);
  }

  startGame(roomId: string) {
    logger.info({
      type: "websocket",
      message: `Starting game in room ${roomId}`,
      roomId,
    });
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.startGame();
  }

  showOwnNumber(roomId: string, ws: WebSocket) {
    logger.info({
      type: "websocket",
      message: `Player requested to show own number in room ${roomId}`,
      roomId,
    });
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.revealOwnNumber(ws);
  }

  resetGame(roomId: string) {
    logger.info({
      type: "websocket",
      message: `Resetting game in room ${roomId}`,
      roomId,
    });
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.resetGame();
  }

  removePlayer(ws: WebSocket) {
    logger.info({
      type: "websocket",
      message: `Removing player from room`,
    });
    for (const room of this.rooms.values()) {
      room.removePlayer(ws);
    }
  }

  getPlayerBySocket(ws: WebSocket): Player | undefined {
    logger.info({
      type: "websocket",
      message: `Getting player by socket`,
    });
    for (const room of this.rooms.values()) {
      const player = room.getPlayerBySocket(ws);
      if (player) return player;
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}
