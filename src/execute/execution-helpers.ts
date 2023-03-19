import { Configuration, OpenAIApi } from "openai"
import storage from "node-persist"
import { ExecutionContext } from "./execution-context"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const getExecutionHelpers = async () => {
  storage.init()
  return {
    context: null as null | ExecutionContext,
    _debug_output_dir: null as null | string,
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
    configureDebug(
      context: ExecutionContext,
      _debug_output_dir: string | null | undefined
    ) {
      if (!_debug_output_dir) {
        this.context = null
        this._debug_output_dir = null
      }
      this.context = context
      this._debug_output_dir = _debug_output_dir as string
    },
    logDebugFile(file_path: string, content: string) {
      if (!this.context) return
      this.context.vfs[`${this._debug_output_dir}/${file_path}`] = content
    },
  }
}

export type ExecutionHelpers = Awaited<ReturnType<typeof getExecutionHelpers>>
