import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import Thumbnail from "../models/Thumbnail.js";

const stylePrompts = {
    "Bold & Graphic":
        "eye-catching thumbnail, bold typography, high contrast, vibrant saturated colors, dramatic composition, strong focal point, clean graphic shapes, designed to stand out at small sizes",
    "Tech/Futuristic":
        "futuristic thumbnail, sleek modern UI elements, glowing neon accents, holographic effects, dark background with cyan and magenta highlights, digital grid patterns, sci-fi atmosphere",
    "Minimalist":
        "minimalist thumbnail, clean layout, generous negative space, simple geometric shapes, limited color palette, subtle gradients, one clear focal element, uncluttered",
    "Photorealistic":
        "photorealistic thumbnail, ultra-detailed, professional photography, realistic lighting and shadows, shallow depth of field, sharp focus on the subject, cinematic quality",
    "Illustrated":
        "illustrated thumbnail, hand-drawn digital illustration, stylized characters, bold outlines, rich colors, playful and expressive, cartoon-like art style",
};

const colorSchemeDescriptions = {
    vibrant: "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
    sunset: "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
    forest: "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
    neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
    purple: "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
    monochrome: "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
    ocean: "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
    pastel: "soft pastel colors, low saturation, gentle tones, calm and dreamy atmosphere",
};

const IMAGES_DIR = "images";

export const generateThumbnail = async (req: Request, res: Response) => {
    let thumbnailId: string | undefined;

    try {
        const { userId } = req.session;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const {
            title,
            prompt: user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
        } = req.body;

        if (!title || !style || !(style in stylePrompts)) {
            return res.status(400).json({ message: "Valid title and style are required" });
        }

        const thumbnail = await Thumbnail.create({
            userId,
            title,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true,
        });
        thumbnailId = thumbnail._id.toString();

        // build the prompt
        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}". `;
        if (color_scheme && color_scheme in colorSchemeDescriptions) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme. `;
        }
        if (user_prompt) {
            prompt += `Additional details: ${user_prompt}. `;
        }
        if (text_overlay) {
            prompt += `Include bold, readable title text on the thumbnail. `;
        }
        prompt += `Visually stunning, designed to maximize click-through rate. Make it bold, professional and impossible to ignore.`;

        // generate the image with Cloudflare Workers AI (FLUX schnell)
        const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ prompt: prompt.slice(0, 2000), steps: 6 }),
            }
        );

        const data: any = await cfRes.json();
        if (!cfRes.ok || !data?.result?.image) {
            console.error("Cloudflare error:", JSON.stringify(data));
            throw new Error(data?.errors?.[0]?.message || "Image generation failed");
        }

        const finalBuffer = Buffer.from(data.result.image, "base64");

        // save the image on the server's disk
        const filename = `thumb-${Date.now()}.png`;
        fs.mkdirSync(IMAGES_DIR, { recursive: true });
        fs.writeFileSync(path.join(IMAGES_DIR, filename), finalBuffer);

        thumbnail.prompt_used = prompt;
        thumbnail.image_url = `${req.protocol}://${req.get("host")}/images/${filename}`;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        return res.status(201).json({
            message: "Thumbnail generated",
            thumbnail,
        });
    } catch (error: any) {
        console.error("generateThumbnail error:", error);

        // remove the failed record so no empty cards are left behind
        if (thumbnailId) {
            await Thumbnail.findByIdAndDelete(thumbnailId);
        }

        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.session;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const thumbnail = await Thumbnail.findOneAndDelete({ _id: id, userId });
        if (!thumbnail) {
            return res.status(404).json({ message: "Thumbnail not found" });
        }

        // also remove the image file from disk, if there is one
        if (thumbnail.image_url) {
            const filename = path.basename(thumbnail.image_url);
            const filePath = path.join(IMAGES_DIR, filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        return res.json({ message: "Thumbnail deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};