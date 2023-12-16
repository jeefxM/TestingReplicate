"use server"

import path from "path";
import Replicate from "replicate";
import fs from 'fs';
import archiver from 'archiver';

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function createZip() {
    const zekeDir = path.join(__dirname, 'zeke');
    const output = fs.createWriteStream(path.join(__dirname, 'zeke2.zip'));
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });
  
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes');
      console.log('Archiver has been finalized and the output file descriptor has closed.');
    });
  
    archive.on('error', function(err) {
      throw err;
    });
  
    archive.pipe(output);
    archive.directory(zekeDir, false);
    await archive.finalize();
}


export async function main() {

    // console.log(replicate.hardware.list())

    const models = await replicate.hardware.list()
    console.log(models)

    const create = await replicate.models.create("jeefxm", "boloo", {
        hardware: "gpu-t4",
    })
    await createZip();

    const training = await replicate.trainings.create(
        "stability-ai",
        "sdxl",
        "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
            destination: "jeefxm/boloo",
            input: {
                input_images: "zeke2.zip"
            },
        }
    );
    console.log("Training created:", create);
    console.log(`URL: https://replicate.ai/p/${training.id}`)
}

main().catch((error) => console.error(error));
