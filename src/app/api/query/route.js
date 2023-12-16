import { NextResponse } from "next/server"

export async function POST(req) {
  // const data = await req.json()
  const {id} = await req.json()
  // const { id } = req.query;

  // console.log("ddd", data)

  
    const response = await fetch(
      
      "https://api.replicate.com/v1/predictions/" + id,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );


    if (response.status !== 200) {
      let error = await response.json();
      return NextResponse.json({status: 500, detail: error.detail})
      
    }
  
    const prediction = await response.json();
    return NextResponse.json({data: prediction})
  }