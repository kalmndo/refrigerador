import { useState } from "react"
import Head from "next/head"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash } from "lucide-react"

import Footer from "@/components/footer"
import { Layout } from "@/components/layout"
import SquigglyLines from "@/components/squiggly-line"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function IndexPage() {
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [summary, setSummary] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [curArticle, setCurArticle] = useState<string>("")
  const [list, setList] = useState<string[]>([])
  const [input, setInput] = useState<string>("")

  const generateSummary = async () => {
    setSummary("")
    setLoading(true)
    const response = await fetch("/api/summarize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: list.join() }),
    })

    if (!response.ok) {
      console.log("error", response.statusText)
      return
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)
      setSummary((prev) => prev + chunkValue)
    }
    setLoading(false)
  }

  return (
    <Layout>
      <Head>
        <title>Refrigerador - Your magic food recipe</title>
        <meta
          name="description"
          content="Summarize any medium article with AI"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="mx-auto mt-20 mb-10 max-w-md px-2.5 text-center sm:max-w-5xl sm:px-0">
        <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.15] text-black sm:text-6xl sm:leading-[1.15]">
          Turn any{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-green-500">Ingredients</span>
          </span>{" "}
          into delicious food with AI
        </h1>
        <h2 className="mt-16 text-sm text-gray-600 sm:text-lg">
          What is in the fridge? 🤔
        </h2>
        <div className="mx-auto mt-5 sm:max-w-sm">
          <div className="flex space-x-5">
            <Input
              placeholder="Input ingredient"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={() => {
                setList([...list, input])
                setInput("")
              }}
            >
              <Plus />
            </Button>
          </div>
          {list?.length > 0 && (
            <div className="flex flex-col items-start mt-10">
              {list.map((value, index) => (
                <div
                  key={index}
                  className="flex w-full justify-between items-center"
                >
                  <span>{`${index + 1}. ${value}`}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setList(list.filter((_, i) => i !== index))}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mx-auto mt-10 flex max-w-fit space-x-4">
          <Button
            disabled={loading}
            size="lg"
            onClick={() => {
              generateSummary()
            }}
          >
            Click for Magic
          </Button>
        </div>
        {summary && (
          <div className="mb-10 px-4">
            <h2 className="mx-auto mt-16 max-w-3xl border-t border-gray-600 pt-8 text-center text-3xl font-bold sm:text-5xl">
              Recipe
            </h2>
            <p>Eat at your own risk!</p>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7 text-left ">
              {summary.split(`\n`).map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <span className="mb-2 list-disc">{sentence}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        <Footer />
      </div>
    </Layout>
  )
}
