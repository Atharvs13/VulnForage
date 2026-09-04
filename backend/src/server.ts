import { config } from './config/index.js';
import { createApp } from './app.js';

const app = createApp();
app.listen(config.port, '0.0.0.0', () => {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), eventType: 'SERVER_READY', url: `http://localhost:${config.port}`, labMode: config.labMode }));
});
