import "dotenv/config";
import { app, server } from "./config/socket.js";
import connectDB from "./config/db.js";

const PORT = process.env.PORT || 4000;

await connectDB();

server.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});