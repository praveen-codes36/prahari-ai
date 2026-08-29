import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 3000

import http from "http";
import { initSocket } from "./socket/index.js";

const server = http.createServer(app);
initSocket(server);

connectDB()
  .then(()=>{
      server.listen(port, () => {
        console.log(`App listening on port http://localhost:${port}`)
      })
  })
  .catch((err)=>{
    console.error("MongoDB connection error",err)
    process.exit()
  })