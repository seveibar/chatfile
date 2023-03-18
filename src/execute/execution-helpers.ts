import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

export const getExecutionHelpers = async () => {
  return {
    openai: new OpenAIApi(configuration),
  }
}

export type ExecutionHelpers = ReturnType<typeof getExecutionHelpers>
