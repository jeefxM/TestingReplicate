import fs from "fs";
import path from "path";
import Replicate from "replicate";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function main() {
    const publicDir = path.join(process.cwd(), "public");
    const zipFilePath = path.join(publicDir, "zeke.zip");

    // Read the contents of the ZIP file
    const zipFileContent = fs.readFileSync(zipFilePath);

    const training = await replicate.trainings.create(
        "stability-ai",
        "sdxl",
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
            destination: "demo/finetune",
            input: {
                input_images: publicDir,
            },
        }
    );
    console.log(`URL: https://replicate.ai/p/${training.id}`)
}

main().catch((error) => console.error(error));
