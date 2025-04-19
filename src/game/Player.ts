import { randomUUID } from "crypto";

export class Player {
  public number?: number;
  public canSee: Record<string, number> = {};
  public id = randomUUID();

  constructor(
    public name: string,
    public socket: WebSocket,
    public roomId: string
  ) {}
}
