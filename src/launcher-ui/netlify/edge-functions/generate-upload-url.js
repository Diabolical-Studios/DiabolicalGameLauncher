import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "npm:uuid";

export default async (req) => {
    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get("contentType") || "image/png";
    const fileExt = searchParams.get("fileExt") || "png";
    const overwriteKey = searchParams.get("overwriteKey");

    const R2_ACCESS_KEY_ID = Netlify.env.get("R2_ACCESS_KEY_ID");
    const R2_SECRET_ACCESS_KEY = Netlify.env.get("R2_SECRET_ACCESS_KEY");

    const s3 = new S3Client({
        region: "auto",
        endpoint: "https://c82515457400147e7f08ee6234e25742.r2.cloudflarestorage.com",
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });

    // 👇 Use the overwrite key if provided
    const key = overwriteKey || `user-uploads/${uuidv4()}.${fileExt}`;

    const command = new PutObjectCommand({
        Bucket: "diabolicallauncher",
        Key: key,
        ContentType: contentType,
        CacheControl: "no-cache"
    });

    try {
        const url = await getSignedUrl(s3, command, { expiresIn: 60 });
        return new Response(
            JSON.stringify({ url, key }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
