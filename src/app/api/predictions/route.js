import { NextResponse } from "next/server"


export async function POST(req) {
  const {prompt} = await req.json()
  console.log(prompt)

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Pinned to a specific version of Stable Diffusion
        // See https://replicate.com/stability-ai/sdxl
        version: "42fe626e41cc811eaf02c94b892774839268ce1994ea778eba97103fe1ef51b8",
  
        // This is the text prompt that will be submitted by a form on the frontend
        input: { prompt: prompt },
      }),
    });
  
    if (response.status !== 201) {
      let error = await response.json();
      NextResponse.json({status: 500})
      NextResponse.json({data: {detail: error.detail}});
      return;
    }
  
    const prediction = await response.json();
    return NextResponse.json({status: 201, data: prediction})
  }