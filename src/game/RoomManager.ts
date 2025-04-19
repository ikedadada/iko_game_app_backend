import { Room } from "./Room.js";
import { Player } from "./Player.js";

export class RoomManager {
  private rooms = new Map<string, Room>();

  joinRoom(roomId: string, name: string, ws: WebSocket) {
    console.log(`Player ${name} joined room ${roomId}`);
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    const room = this.rooms.get(roomId)!;
    room.addPlayer(name, ws);
  }

  startGame(roomId: string) {
    console.log(`Starting game in room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.startGame();
  }

  showOwnNumber(roomId: string, ws: WebSocket) {
    console.log(`Player requested to show own number in room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.revealOwnNumber(ws);
  }

  resetGame(roomId: string) {
    console.log(`Resetting game in room ${roomId}`);
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.resetGame();
  }

  removePlayer(ws: WebSocket) {
    console.log(`Removing player from room`);
    for (const room of this.rooms.values()) {
      room.removePlayer(ws);
    }
  }

  getPlayerBySocket(ws: WebSocket): Player | undefined {
    console.log(`Getting player by socket`);
    for (const room of this.rooms.values()) {
      const player = room.getPlayerBySocket(ws);
      if (player) return player;
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}
