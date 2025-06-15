import { Hono } from 'hono';
import { html } from 'hono/html';

import { upgradeWebSocket } from 'hono/deno';

const app = new Hono();

app.get('/', (c) => {
  return c.html(
    <html>
      <head>
        <meta charset='UTF-8' />
      </head>
      <body>
        <div id='now-time'></div>
        {html`
          <script>
            const ws = new WebSocket('wss://deno-deploy-ws-test.deno.dev/ws');
            const $nowTime = document.getElementById('now-time');
            ws.onmessage = (event) => {
              $nowTime.textContent = event.data;
            };
          </script>
        `}
      </body>
    </html>
  );
});

app.get(
  '/ws',
  upgradeWebSocket(() => {
    // deno-lint-ignore no-explicit-any
    let intervalId: any;
    return {
      onOpen(_event, ws) {
        intervalId = setInterval(() => {
          ws.send(new Date().toString());
        }, 1000);
      },
      onClose() {
        clearInterval(intervalId);
      },
    };
  })
);
Deno.serve(app.fetch);
