import { RoomManager } from "../game/RoomManager.js";
import { ClientMessage } from "../types/messages.js";

export function handleOpen(ws: WebSocket, roomManager: RoomManager) {
  // noop for now
  console.log("WebSocket opened");
  ws.send(JSON.stringify({ type: "connected" }));
}

export function handleMessage(
  ws: WebSocket,
  data: string,
  roomManager: RoomManager
) {
  console.log("Received message:", data);
  let msg: ClientMessage;
  try {
    msg = JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse message:", data);
    return;
  }

  const player = roomManager.getPlayerBySocket(ws);
  let roomId = msg.roomId || player?.roomId;
  if (!roomId) return;

  switch (msg.type) {
    case "join":
      roomManager.joinRoom(roomId, msg.name, ws);
      break;
    case "start-game":
      roomManager.startGame(roomId);
      break;
    case "show-own-number":
      roomManager.showOwnNumber(roomId, ws);
      break;
    case "reset-game":
      roomManager.resetGame(roomId);
      break;
    default:
      console.warn("Unknown message type:", msg);
  }
}

export function handleClose(ws: WebSocket, roomManager: RoomManager) {
  console.log("WebSocket closed");
  roomManager.removePlayer(ws);
}
