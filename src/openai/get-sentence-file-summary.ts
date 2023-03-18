import { ExecutionHelpers } from "execute"

export const getSentenceFileSummary = async (
  {
    file,
    engine,
    context_prompt,
  }: {
    file: string
    engine: string
    context_prompt?: string
  },
  helpers: ExecutionHelpers
) => {
  // TODO Different logic for short vs long files
  const is_long_file = file.split("\n").length > 100

  let prompt = "Provide a single-sentence summary of the following file."
  if (prompt) {
    prompt += `The summary should help with identifying if this file is relevant for answering the question "${context_prompt}".`
  }

  prompt += `\n\n${file}`

  const result = await helpers.getCachedPrompt(engine, prompt)

  return result
}
