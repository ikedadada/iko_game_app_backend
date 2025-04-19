import { Player } from "./Player";

export class Room {
  private players: Player[] = [];
  constructor(public roomId: string) {}

  addPlayer(name: string, socket: WebSocket) {
    const isPlaying = this.players.some((p) => p.number !== undefined);
    if (isPlaying) {
      socket.send(JSON.stringify({ type: "game-already-started" }));
      return;
    }
    const player = new Player(name, socket, this.roomId);
    this.players.push(player);
    this.broadcast({
      type: "set-players",
      roomId: this.roomId,
      players: this.players.map((p) => ({ name: p.name })),
    });
  }

  startGame() {
    const numbers = this.shuffle([...Array(100)].map((_, i) => i + 1));
    this.players.forEach((player, i) => {
      player.number = numbers[i];
      player.canSee = {};
      player.socket.send(
        JSON.stringify({
          type: "start-game",
          number: player.number,
        })
      );
    });
  }

  revealOwnNumber(socket: WebSocket) {
    const sender = this.players.find((p) => p.socket === socket);
    if (!sender || sender.number === undefined) return;
    this.players.forEach((p) => {
      p.canSee[sender.name] = sender.number!;
      p.socket.send(
        JSON.stringify({
          type: "show-own-number",
          canSee: p.canSee,
        })
      );
    });
  }

  resetGame() {
    this.players.forEach((p) => {
      p.number = undefined;
      p.canSee = {};
      p.socket.send(JSON.stringify({ type: "reset-game" }));
    });
  }

  removePlayer(socket: WebSocket) {
    const index = this.players.findIndex((p) => p.socket === socket);
    if (index !== -1) {
      this.players.splice(index, 1);
      this.broadcast({
        type: "set-players",
        roomId: this.roomId,
        players: this.players.map((p) => ({ name: p.name })),
      });
    }
  }

  getPlayerBySocket(socket: WebSocket) {
    return this.players.find((p) => p.socket === socket);
  }

  private broadcast(message: any) {
    this.players.forEach((p) => {
      if (p.socket.readyState === WebSocket.OPEN) {
        p.socket.send(JSON.stringify(message));
      }
    });
  }

  private shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }
}
