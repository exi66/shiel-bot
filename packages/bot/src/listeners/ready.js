import { Listener } from "@sapphire/framework";
import { createLogger } from "@shiel/shared/logger";
import { startWorkers } from "../lib/worker.js";

const log = createLogger("bot");

export class ReadyListener extends Listener {
  constructor(context) {
    super(context, { once: true, event: "ready" });
  }

  run(client) {
    log.info(`logged in as ${client.user.tag}`);
    startWorkers(client);
  }
}
