import { Listener } from '@sapphire/framework';
import { startWorkers } from '../lib/worker.js';

export class ReadyListener extends Listener {
  constructor(context) {
    super(context, { once: true, event: 'ready' });
  }

  run(client) {
    console.log(`Bot logged in as ${client.user.tag}`);
    startWorkers(client);
  }
}
