export class Player {
  public number?: number;
  public canSee: Record<string, number> = {};

  constructor(
    public name: string,
    public socket: WebSocket,
    public roomId: string
  ) {}
}
