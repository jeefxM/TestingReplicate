// "use server"
const path = require('path');
const Replicate = require('replicate');
const fs = require('fs');
const archiver = require('archiver');
// const path = require('path');

const replicate = new Replicate({
    auth: "r8_CoDlu9eDR2NlQEbB5JPjpmpKJabCWOs2sF7sk",
});

async function zipImagesAndCreateLink() {
    const inputFolder = path.resolve(__dirname, "your_image_folder");
    const outputZipFilePath = path.resolve(__dirname, "images.zip");

    // Create an output stream to write the zip file
    const output = fs.createWriteStream(outputZipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Pipe the archive data to the output file
    archive.pipe(output);

    // Add all files from the input folder to the archive
    archive.directory(inputFolder, false);

    // Finalize the archive
    await archive.finalize();

    // Print a message indicating the zip file creation
    console.log(`Images zipped successfully to: ${outputZipFilePath}`);

    // Return the path to the generated zip file
    return outputZipFilePath;
}

async function main() {

    // console.log(replicate.hardware.list())
    const zipFilePath = await zipImagesAndCreateLink();

    const models = await replicate.hardware.list()
    console.log(models)

    const create = await replicate.models.create("jeefxm", "boqwweww", {
        hardware: "gpu-a40-large",
    })

    const training = await replicate.trainings.create(
        "stability-ai",
        "sdxl",
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
            destination: "jeefxm/boqwweww",
            input: {
                input_images: zipFilePath
            },
        }
    );
    console.log("Training created:", create);
    console.log(`URL: https://replicate.ai/p/${training.id}`)
}

main().catch((error) => console.error(error));
