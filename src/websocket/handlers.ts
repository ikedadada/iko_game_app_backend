import { RoomManager } from "../game/RoomManager.js";
import { ClientMessage } from "../types/messages.js";
import { logger } from "../utils/logger.js";

export function handleOpen(ws: WebSocket, roomManager: RoomManager) {
  // noop for now
  logger.info({
    type: "websocket",
    message: "WebSocket connection opened",
  });
  ws.send(JSON.stringify({ type: "connected" }));
}

export function handleMessage(
  ws: WebSocket,
  data: string,
  roomManager: RoomManager
) {
  logger.info({
    type: "websocket",
    message: "WebSocket message received",
    data,
  });
  let msg: ClientMessage;
  try {
    msg = JSON.parse(data);
  } catch (e) {
    logger.error({
      type: "websocket",
      message: "Failed to parse message",
      error: e,
      data,
    });
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
      logger.warn({
        type: "websocket",
        message: "Unknown message type",
        data,
      });
      break;
  }
}

export function handleClose(ws: WebSocket, roomManager: RoomManager) {
  logger.info({
    type: "websocket",
    message: "WebSocket connection closed",
  });
  roomManager.removePlayer(ws);
}
