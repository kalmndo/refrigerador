import { OpenAIStream } from "@/lib/utils"

export const config = {
  runtime: "edge",
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI")
}

export default async function handler(req: Request) {
  const { text } = (await req.json()) as {
    text?: string
  }

  if (!text) {
    return new Response("No prompt in the request", { status: 500 })
  }

  try {
    const prompt = `
    I want you write a recipe and response in indonesia, don't say any words in english just indonesia
    And sounds like a chef made,
    and you should make sense, for example you can't fried durian right?. so make it sense
    Ingredients: 
    "${text}"

    Instructions:
    `

    const payload = {
      model: "text-davinci-003",
      prompt,
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 200,
      stream: true,
      n: 1,
    }

    const stream = await OpenAIStream(payload)

    return new Response(stream)
  } catch (e: any) {
    console.log({ e })
    return new Response(e, { status: 500 })
  }
}
