import { createApp } from "./app";

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT ?? DEFAULT_PORT);

const app = createApp();
app.listen(port, () => {
  // Keep startup log concise for CI and local runs.
   
  console.log(`Mini Fintech API listening on port ${port}`);
});
