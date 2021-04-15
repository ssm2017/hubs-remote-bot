const fs = require("fs");
const path = require("path");
// utils
const utils = require("./utils.js");
// bots
const BotsList = require("./BotsList.js");
const { buildJsonResponse } = require("./utils.js");

var botsList = new BotsList();

module.exports = function (httpServer) {
  // home
  httpServer.get("/", function (req, res) {
    res.send("Ok");
  });

  // new bot
  httpServer.post("/api/bots", async (req, res) => {
    try {
      let params = {
        spawn_point: req.body.spawn_point || null,
        name: req.body.name || Date.now(),
        room_url: req.body.room_url || "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
        audio_volume: process.env.AUDIO_VOLUME || 1,
        userDataDir: process.env.USER_DATA_DIR || "./assets/chrome-profile/User Data/",
        autoLog: process.env.AUTOLOG || true,
      };
      if (params.name.length > 26) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Name too long. 26 max."
          }
        });
        return;
      }
      let response = await botsList.newBot(params);
      res.status(200).json(response);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // get bots list
  httpServer.get("/api/bots", function (req, res) {
    try {
      const result = botsList.getBotsList();
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json(
        buildJsonResponse({
          error: {
            status: 500,
            message: e.message,
          }
        })
      );
    }
  });
  // fake bots list
  httpServer.get("/api/fake/bots", function (req, res) {
    const result = [
      {
        uuid: "1ec2c697-1e08-4bf9-b17f-7b64a51693a3",
        name: "a",
        room_url: "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
      },
      {
        uuid: "ae49189b-7118-4678-94ca-8fc15bdc9eae",
        name: "aa",
        room_url: "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
      },
      {
        uuid: "68ab7c96-b218-45c0-8e90-ab8c0e6d84ef",
        name: "aaa",
        room_url: "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
      },
      {
        uuid: "c2c00124-d4ef-4ccd-908a-196d72766c23",
        name: "aaaa",
        room_url: "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
      },
      {
        uuid: "0c5521ad-7dab-47f9-a88e-fdf15921cd2b",
        name: "aaaaa",
        room_url: "https://hubs.mozilla.com/jtbhYFh/adorable-cultured-venture",
      },
    ];
    res.status(200).json(result);
  });

  // get bot infos
  httpServer.get("/api/bots/:uuid", function (req, res) {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      console.log("bots", botsList.bots);
      const result = botsList.getBotInfos(uuid);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // delete bot
  httpServer.delete("/api/bots/:uuid", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      const result = await botsList.deleteBot(uuid);
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // update bot
  httpServer.patch("/api/bots/:uuid", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get the name
      let name = req.body.name || null;
      if (!name) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Name needed.",
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      await bot.changeName(name);
      res.status(200).json({
        uuid: bot.uuid,
        name: bot.name,
      });
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // play file
  httpServer.post("/api/bots/:uuid/play", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      // get file
      let default_audio_file = process.env.AUDIO_FILE || "bot-recording.mp3";
      let filename = req.body.filename || default_audio_file;
      let assets_folder = process.env.ASSETS_FOLDER || "./assets";
      let file_to_play = assets_folder + "/" + filename;
      // play the file
      await bot.playFile(file_to_play);
      res.status(200).json({file: file_to_play});
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // spawn object
  httpServer.post("/api/bots/:uuid/objects", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      let default_object_url =
        process.env.DEFAULT_OBJECT_URL ||
        "https://uploads-prod.reticulum.io/files/031dca7b-2bcb-45b6-b2df-2371e71aecb1.glb";
      let params = {
        url: req.query.url || default_object_url,
        position: req.query.position || `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`,
        rotation: req.query.rotation || "0 0 0",
        scale: req.query.scale || "1 1 1",
        pinned: req.query.pinned || true,
        dynamic: req.query.dynamic || false,
        projection: req.query.projection || null,
        interval: req.query.interval || null,
      };
      // loop ?
      if (params.interval) {
        if (params.interval > 0) {
          if (!bot.interval) {
            bot.interval = setInterval(() => {
              params.position = `${Math.random() * 3 - 1.5} ${Math.random() * 2 + 1} ${Math.random() * 4 - 2}`;
              bot.spawnObject(params);
            }, params.interval);
          }
        } else {
          clearInterval(bot.interval);
          bot.interval = null;
        }
      } else {
        await bot.spawnObject(params);
      }
      res.status(200).json(params);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // delete all objects
  httpServer.delete("/api/bots/:uuid/objects", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      await bot.deleteAllObjects();
      res.status(200).json({uuid:uuid});
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  // get position
  httpServer.get("/api/bots/:uuid/position", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }

      let result = await bot.getPosition();
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        },
      });
    }
  });

  // move to
  httpServer.post("/api/bots/:uuid/position", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      let params = {
        x: req.body.x || 0,
        y: req.body.y || 0,
        z: req.body.z || 0,
      };
      // check values
      if (isNaN(params.x) || isNaN(params.y) || isNaN(params.z)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "x, y or z must be a number.",
          },
        });
        return;
      }

      await bot.goTo(params);
      res.status(200).json({
        x: params.x,
        y: params.y,
        z: params.z
      });
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        },
      });
    }
  });

  // get waypoints
  httpServer.get("/api/bots/:uuid/waypoints", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      const result = await bot.getWaypoints();
      res.status(200).json(result);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });
  // fake waypoints
  httpServer.get("/api/fake/bots/waypoints", async (req, res) => {
    const result = [{ name: "sp1" }, { name: "sp2" }, { name: "sp3" }];
    res.json(result);
  });

  // jumpt to
  httpServer.post("/api/bots/:uuid/jumpto", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      await bot.jumpTo(req.body.waypoint || "");
      res.status(200).json(req.body.waypoint);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        },
      });
    }
  });

  // say in chat
  httpServer.post("/api/bots/:uuid/say", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      let message = req.query.message || "Hello";
      await bot.say(message);
      res.status(200).json(message);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });

  httpServer.get("/api/system/assets", async (req, res) => {
    try {
      let assets_folder = process.env.ASSETS_FOLDER + "/" || "./assets/";
      let filenames = {
        mp3: [],
        json: [],
      };
      const files = fs.readdirSync(assets_folder);
      if (files.length) {
        for (const file of files) {
          if (file.indexOf(".mp3") == file.length - 4) {
            filenames.mp3.push(file);
          } else if (file.indexOf(".json") == file.length - 5) {
            filenames.json.push(file);
          }
        }
      }
      res.status(200).json(filenames);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });
  httpServer.get("/api/bots/:uuid/audiocontext", async (req, res) => {
    try {
      // get uuid
      let uuid = req.params.uuid || null;
      // check uuid
      if (!botsList.checkUuid(uuid)) {
        res.status(400).json({
          error: {
            status: 400,
            message: "Wrong uuid."
          }
        });
        return;
      }
      // get bot
      const bot = botsList.getBotByUuid(uuid);
      if (!bot) {
        res.status(404).json({
          error: {
            status: 404,
            message: "Bot not found.",
          }
        });
        return;
      }
      let message = req.query.message || "Hello";
      let response = await bot.getAudioContext();
      res.status(200).json(response);
    } catch (e) {
      res.status(500).json({
        error: {
          status: 500,
          message: e.message,
        }
      });
    }
  });
  // httpServer.get('/client', (req, res) => {
  // 	res.sendFile(path.join(__dirname, '../client/build/index.html'));
  // })
  httpServer.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  });
  // listen to the chat
  // httpServer.get('/api/todo', async(req, res) => {
  // 	let response = await listenTo({text: "tutu"});
  // 	res.json(response);
  // });
};
