// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  message: string,
  pointsOfInterestPrompt: any,
  itinerary: any,
}

type Error = {
  message: string,
}

const GPT_KEY = process.env.GPT_API_KEY

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${GPT_KEY}`
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Error>
) {
  let days, city
  if (req.body) {
    let body = JSON.parse(req.body)
    days = body.days
    city = body.city
  }

  const parts = city.split(' ')

  if (parts.length > 5) {
    throw new Error('please reduce size of request')
  }
  
  if (days > 10) {
    days = 10
  }

 // XXXXX let basePrompt = `You are a travel guide that knows everything about ${city}, I am a first time visitor who wants to explore all of the city's best historical attractions, eat at the best rated restaurants, and do a few fun and adveneterous activities. What is an ideal and interesting itinerary for ${days} days in ${city}?`
 let basePrompt = `What is an ideal and interesting itinerary for ${days} days in ${city}?`
 
 try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: basePrompt,
        temperature: 0,
        max_tokens: 550
      })
    })
    const itinerary = await response.json()
    const pointsOfInterestPrompt = 'Extract the points of interest out of this text, with no additional words, separated by commas: ' + itinerary.choices[0].text

    res.status(200).json({
      message: 'success',
      pointsOfInterestPrompt,
      itinerary: itinerary.choices[0].text
    })

  } catch (err) {
    console.log('error: ', err)
  }
}
