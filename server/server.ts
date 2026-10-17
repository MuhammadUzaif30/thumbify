import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import connectDB from "./configs/db.js";
import AuthRouter from "./routes/AuthRoutes.js";
import ThumbnailRouter from "./routes/ThumbnailRoutes.js";
import UserRouter from "./routes/UserRoutes.js";

declare module "express-session" {
    interface SessionData {
        isLoggedIn: boolean;
        userId: string;
    }
}

const app = express();
const isProd = process.env.NODE_ENV === "production";

// needed behind Vercel's proxy so secure cookies and https URLs work
app.set("trust proxy", 1);

app.use(cors({
    origin: ["http://localhost:5173", process.env.CLIENT_URL].filter(Boolean) as string[],
    credentials: true,
}));

app.use(express.json());
app.use("/images", express.static("images"));

// Serverless: make sure the DB is connected before handling any request.
// connectDB() must be safe to call many times (see the guard in configs/db.ts).
app.use(async (req: Request, res: Response, next: NextFunction) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});

app.use(session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        secure: isProd,
        // frontend and backend are on different *.vercel.app domains,
        // so in production the cookie must be "none" (requires secure: true)
        sameSite: isProd ? "none" : "lax",
    },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI as string,
        collectionName: "sessions",
    }),
}));

app.get("/", (req: Request, res: Response) => {
    res.send("Server is Live!");
});

app.use("/api/auth", AuthRouter);
app.use("/api/thumbnail", ThumbnailRouter);
app.use("/api/user", UserRouter);

// Only start a listener locally. On Vercel the platform calls the exported app.
if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000 ;
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

export default app; 