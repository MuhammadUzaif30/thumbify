import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { GenerateContentConfig } from "@google/genai";
import Thumbnail from "../models/Thumbnail.js";
import ai from "../configs/ai.js";
import { v2 as cloudinary } from "cloudinary";

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

        const model = "gemini-2.5-flash-image";

        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ["IMAGE"],
        };

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}". `;

        if (color_scheme) {
            prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme. `;
        }
        if (user_prompt) {
            prompt += `Additional details: ${user_prompt}. `;
        }
        if (text_overlay) {
            prompt += `Include bold, readable title text on the thumbnail. `;
        }
        prompt += `Visually stunning, designed to maximize click-through rate. Make it bold, professional and impossible to ignore.`;

        // generate image using the AI model
        const response: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig,
        });

        // check if the response is valid
        const parts = response?.candidates?.[0]?.content?.parts;
        if (!parts) {
            throw new Error("Unexpected response from the image model");
        }

        let finalBuffer: Buffer | null = null;
        for (const part of parts) {
            if (part.inlineData?.data) {
                finalBuffer = Buffer.from(part.inlineData.data, "base64");
            }
        }
        if (!finalBuffer) {
            throw new Error("No image returned by the model");
        }

        const filename = `final-output-${Date.now()}.png`;
        const filePath = path.join("images", filename);

        // create the images directory if it doesn't exist
        fs.mkdirSync("images", { recursive: true });
        //write final image to the file
        fs.writeFileSync(filePath, finalBuffer);

        // upload to Cloudinary, then clean up the local file
        const uploadResult = await cloudinary.uploader.upload(filePath, {
            resource_type: "image",
        });
        fs.unlinkSync(filePath);

        thumbnail.prompt_used = prompt;
        thumbnail.image_url = uploadResult.secure_url;
        thumbnail.isGenerating = false;
        await thumbnail.save();

        return res.status(201).json({
            message: "Thumbnail generated",
            thumbnail,
        });
    } catch (error: any) {
        console.error("generateThumbnail error:", error);

        // don't leave the record stuck in "generating"
        if (thumbnailId) {
            await Thumbnail.findByIdAndUpdate(thumbnailId, { isGenerating: false });
        }

        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};
//Controller for thumbnail deletion
// Controller for thumbnail deletion
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

        return res.json({ message: "Thumbnail deleted successfully" });
    } catch (error: any) {
        return res.status(500).json({ message: error.message || "Something went wrong" });
    }
};