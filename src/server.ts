// src/server.ts
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { WSEvents } from "hono/ws";

import { handleMessage, handleOpen, handleClose } from "@/websocket/handlers";
import { RoomManager } from "@/game/RoomManager";

const app = new Hono();
app.get("/healthcheck", (c) => c.text("healthy"));
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });
const roomManager = new RoomManager();
app.get(
  "/ws",
  upgradeWebSocket((c): WSEvents<WebSocket> => {
    return {
      onOpen: (evt, ws): void => {
        if (!ws.raw) throw new Error("rawWs is undefined");
        handleOpen(ws.raw, roomManager);
      },
      onMessage: (evt, ws) => {
        if (!ws.raw) throw new Error("rawWs is undefined");
        handleMessage(ws.raw, evt.data.toString(), roomManager);
      },
      onClose: (evt, ws) => {
        if (!ws.raw) throw new Error("rawWs is undefined");
        handleClose(ws.raw, roomManager);
      },
    };
  })
);

const port = parseInt(process.env.PORT || "8000");
const server = serve({ fetch: app.fetch, port }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});
injectWebSocket(server);
