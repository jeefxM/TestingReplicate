"use client"

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../app/styles.css";

import Replicate from "replicate";
import {main} from "../app/fineTune/fineTuning.js"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);

  console.log("eee", image)

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
      }),
    });
    let prediction = await response.json();
  
  
    if (response.status !== 200) {
      setError(prediction.detail);
      return;
    }
    setImage(prediction.data);

    while (
      
      prediction.data.status !== "succeeded" &&
      prediction.data.status !== "failed"
    ) {
   
      await sleep(1000);
      const response = await fetch("/api/query",  {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: prediction.data.id,
        }),
      
      });

      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      console.log({prediction})
      setImage(prediction.data);
    }
  };

  const handleButtonClick = async () => {
    try {
      await main();
      console.log("Training initiated successfully");
    } catch (error) {
      console.error("Error initiating training:", error);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Replicate + Next.js</title>
      </Head>

      <p>
        Dream something with{" "}
        <a href="https://replicate.com/stability-ai/stable-diffusion">SDXL</a>:
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <input type="text" name="prompt" placeholder="Enter a prompt to display an image" />
        <button type="submit">Go!</button>
      </form>
      <button onClick={handleButtonClick}>Initiate Training</button>

      {error && <div>{error}</div>}

      {image && (
        <div>
            {image.output && (
              <div className={styles.imageWrapper}>
              <Image
                fill
                src={image.output[image.output.length - 1]}
                alt="output"
                sizes='100vw'
              />
              </div>
            )}
            <p>status: {image.status}</p>
        </div>
      )}
    </div>
  );
}