import { Configuration, OpenAIApi } from "openai"
import storage from "node-persist"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const getExecutionHelpers = async () => {
  storage.init()
  return {
    openai: new OpenAIApi(configuration),
    async getCachedPrompt(engine: string, user_prompt: string) {
      const cached_result = await storage.getItem(`${engine}:${user_prompt}`)
      if (cached_result) return cached_result
      console.log(`Submitting prompt "${user_prompt.slice(0, 20)}"...`)
      const response = await this.openai.createChatCompletion({
        messages: [
          {
            role: "user",
            content: user_prompt,
          },
        ],
        model: engine,
      })
      const result = response.data.choices?.[0]?.message?.content
      if (!result) throw new Error(`Did not get result for prompt`)
      await storage.setItem(`${engine}:${user_prompt}`, result)
      return result
    },
  }
}

export type ExecutionHelpers = Awaited<ReturnType<typeof getExecutionHelpers>>
