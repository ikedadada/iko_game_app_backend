import { Room } from "./Room";
import { Player } from "./Player";

export class RoomManager {
  private rooms = new Map<string, Room>();

  joinRoom(roomId: string, name: string, ws: WebSocket) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Room(roomId));
    }
    const room = this.rooms.get(roomId)!;
    room.addPlayer(name, ws);
  }

  startGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.startGame();
  }

  showOwnNumber(roomId: string, ws: WebSocket) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.revealOwnNumber(ws);
  }

  resetGame(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.resetGame();
  }

  removePlayer(ws: WebSocket) {
    for (const room of this.rooms.values()) {
      room.removePlayer(ws);
    }
  }

  getPlayerBySocket(ws: WebSocket): Player | undefined {
    for (const room of this.rooms.values()) {
      const player = room.getPlayerBySocket(ws);
      if (player) return player;
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }
}
