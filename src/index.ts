import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { Hono } from "hono";
import { WSEvents } from "hono/ws";

const app = new Hono();

app.get("/healthcheck", (c) => {
  return c.text("healthy");
});

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

type RoomId = string;
type PlayerName = string;
type Player = {
  name: PlayerName;
  client: WebSocket;
  number?: number;
  canSee?: {
    [p: PlayerName]: number;
  };
};
const rooms = new Map<RoomId, Player[]>();

app.get(
  "/ws",
  upgradeWebSocket((c): WSEvents<WebSocket> => {
    return {
      onOpen: (evt, ws): void => {
        console.log("WebSocket opened");
        ws.send(JSON.stringify({ message: "connected" }));
      },
      onMessage: (evt, ws): void => {
        console.log("before rooms", rooms);
        const msg = JSON.parse(evt.data.toString());

        switch (msg.type) {
          case "join":
            const { roomId, name } = msg as {
              roomId: RoomId;
              name: PlayerName;
            };
            const client = ws.raw;
            if (!client) throw new Error("rawWs is undefined");
            let players: Player[] = [];
            let isPlayingNow = false;
            if (rooms.has(roomId)) {
              players = rooms.get(roomId) || [];
              isPlayingNow = players.some((p) => p.number !== undefined);
            }
            if (isPlayingNow) {
              client.send(
                JSON.stringify({
                  type: "game-already-started",
                })
              );
              return;
            }
            players.push({ name, client });
            rooms.set(roomId, players);

            for (const player of players) {
              if (player.client.readyState === WebSocket.OPEN) {
                player.client.send(
                  JSON.stringify({
                    type: "set-players",
                    roomId,
                    players,
                  })
                );
              }
            }
            break;
          case "start-game":
            const { roomId: startRoomId } = msg as { roomId: RoomId };
            const playersInRoom = rooms.get(startRoomId);
            if (!playersInRoom) throw new Error("playersInRoom is undefined");

            const availableNumbers = Array.from(
              { length: 100 },
              (_, i) => i + 1
            ).sort(() => Math.random() - 0.5);

            rooms.set(
              startRoomId,
              playersInRoom.map((player, i) => {
                const number = availableNumbers[i];
                player.number = number;
                player.canSee = {};
                player.client.send(
                  JSON.stringify({
                    type: "start-game",
                    number,
                  })
                );
                return player;
              })
            );
            break;
          case "show-own-number":
            const { roomId: showRoomId } = msg as { roomId: RoomId };
            const playersInShowRoom = rooms.get(showRoomId);
            if (!playersInShowRoom)
              throw new Error("playersInShowRoom is undefined");
            const player = playersInShowRoom.find((p) => p.client === ws.raw);
            if (!player) throw new Error("player is undefined");
            const ownNumber = player.number;
            if (ownNumber === undefined)
              throw new Error("ownNumber is undefined");

            rooms.set(
              showRoomId,
              playersInShowRoom.map((p) => {
                if (p.number === undefined)
                  throw new Error("number is undefined");
                const prevCanSee = player.canSee || {};
                const canSee = {
                  ...prevCanSee,
                  [player.name]: ownNumber,
                };

                if (p.client.readyState === WebSocket.OPEN) {
                  p.client.send(
                    JSON.stringify({
                      type: "show-own-number",
                      canSee: canSee,
                    })
                  );
                }
                p.canSee = canSee;
                return p;
              })
            );
            break;
          case "reset-game":
            const { roomId: resetRoomId } = msg as { roomId: RoomId };
            const playersInResetRoom = rooms.get(resetRoomId);
            if (!playersInResetRoom)
              throw new Error("playersInResetRoom is undefined");
            rooms.set(
              resetRoomId,
              playersInResetRoom.map((p) => {
                p.number = undefined;
                p.canSee = {};
                if (p.client.readyState === WebSocket.OPEN) {
                  p.client.send(
                    JSON.stringify({
                      type: "reset-game",
                    })
                  );
                }
                return p;
              })
            );
            break;
          default:
            console.log("Unknown message type:", msg.type);
            break;
        }
        console.log("after rooms", rooms);
      },
      onClose(evt, ws) {
        const client = ws.raw;
        if (!client) throw new Error("rawWs is undefined");
        for (const [roomId, players] of rooms.entries()) {
          const index = players.findIndex((p) => p.client === client);
          if (index !== -1) {
            players.splice(index, 1);
            if (players.length === 0) {
              rooms.delete(roomId);
            } else {
              for (const player of players) {
                if (player.client.readyState === WebSocket.OPEN) {
                  player.client.send(
                    JSON.stringify({
                      type: "set-players",
                      roomId,
                      players,
                    })
                  );
                }
              }
            }
            break;
          }
        }
        ws.close();
        console.log("WebSocket closed");
      },
    };
  })
);

if (process.env.PORT === undefined) throw new Error("PORT is not defined");
const port = parseInt(process.env.PORT) || 8000;

const server = serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
injectWebSocket(server);
