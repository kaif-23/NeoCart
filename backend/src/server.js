import dotenv from "dotenv";
import app from "./app.js";
import connectDb from "./config/db.js";

dotenv.config();

const port = process.env.PORT || 6000;

// Start Server
app.listen(port, () => {
    console.log("Hello From Server", port);
    connectDb();
});
