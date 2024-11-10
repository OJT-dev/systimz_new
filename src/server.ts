import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';
import { createWebSocketHandler } from './server/websocket';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling request:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Initialize WebSocket handler
  createWebSocketHandler(server);

  server.listen(port, hostname, () => {
    console.log(
      `> Ready on http://${hostname}:${port} as ${
        dev ? 'development' : process.env.NODE_ENV
      }`
    );
  });
});
