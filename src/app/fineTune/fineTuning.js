// "use server"
const path = require('path');
const Replicate = require('replicate');
const fs = require('fs');
const archiver = require('archiver');
const {Storage} = require('@google-cloud/storage');
// import ModelTraining from "../fineTune/ModelTraining.json"
// const {ModelTraining} = require("../fineTune/ModelTraining.json")
// const path = require('path');

let projectId = "408411"

const ModelTrainingPath = path.resolve(__dirname, '../fineTune/ModelTraining.json');


const storage = new Storage({
    projectId: projectId,
    keyFilename: ModelTrainingPath
})
const bucketName = "davitsstorage"

const bucket = storage.bucket(bucketName)

const replicate = new Replicate({
    auth: "r8_CoDlu9eDR2NlQEbB5JPjpmpKJabCWOs2sF7sk",
});

function zipImagesAndCreateLink() {
    return new Promise((resolve, reject) => {
        const inputFolder = path.resolve(__dirname, "images");
        const outputZipFilePath = path.resolve(__dirname, "images8.zip");

        // Create an output stream to write the zip file
        const output = fs.createWriteStream(outputZipFilePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        archive.on('error', function(err) {
            reject(err);
        });

        // Pipe the archive data to the output file
        archive.pipe(output);

        // Add all files from the input folder to the archive
        archive.directory(inputFolder, false);

        // Listen for the 'close' event on the output stream
        output.on('close', function() {
            console.log(`Images zipped successfully to: ${outputZipFilePath}`);
            resolve(outputZipFilePath);
        });

        // Finalize the archive
        archive.finalize();
    });
}

async function main() {

    // console.log(replicate.hardware.list())
    const zipFilePath = await zipImagesAndCreateLink();

    await bucket.upload(path.resolve(__dirname, zipFilePath), {
        destination: 'images8.zip',
        public: true, // Make the file publicly accessible
        metadata: {
            cacheControl: 'public, max-age=31536000'
        }    
    });
    
    // Log the public URL for the uploaded file
    const publicUrl = `https://storage.googleapis.com/${bucketName}/images8.zip`;
    console.log(`File uploaded to: ${publicUrl}`);

    // const models = await replicate.hardware.list()
    // console.log(models)

    const create = await replicate.models.create("jeefxm", "traini", {
        hardware: "gpu-a40-large",
    })

    const training = await replicate.trainings.create(
        "stability-ai",
        "sdxl",
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
            destination: "jeefxm/traini",
            input: {
                input_images: publicUrl
            },
        }
    );
    console.log("Training created:", create);
    console.log(`URL: https://replicate.ai/p/${training.id}`)
}

main().catch((error) => console.error(error));
