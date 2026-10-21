import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./config/socket.js";

// One HTTP server serves both the Express app and Socket.IO.
const server = http.createServer(app);
initSocket(server);

// Number() also guards against values like " 4000" in .env
const PORT = Number(process.env.PORT) || 4000;

await connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
