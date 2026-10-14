import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./configs/db.js";
import AuthRouter from "./routes/AuthRoutes.js"; // check this path matches your folder

declare module "express-session" {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}

const app = express();

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI as string,
        collectionName: "sessions",
    }),
}));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);

const port = process.env.PORT || 3000;

const start = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
};

start();