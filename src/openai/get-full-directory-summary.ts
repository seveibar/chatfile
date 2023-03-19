import { getSentenceFileSummary } from "openai/get-sentence-file-summary"
import { ExecutionHelpers } from "execute"

export const getFullDirectorySummary = async (
  {
    vfs,
    engine,
    context_prompt,
  }: {
    vfs: Record<string, string>
    engine: string
    context_prompt: string
  },
  helpers: ExecutionHelpers
) => {
  const file_summary_lines: Array<string> = []
  const $summaries = Object.entries(vfs).map(
    async ([file_path, file_content]) => {
      const summary = await getSentenceFileSummary(
        {
          file: file_content as string,
          engine,
          context_prompt,
        },
        helpers
      )
      helpers.logDebugFile(`${file_path}.summary.txt`, summary.trim())
      file_summary_lines.push(`${file_path}: ${summary.trim()}`.trim())
    }
  )
  await Promise.all($summaries)
  return file_summary_lines
    .map((a) => a.trim())
    .sort()
    .join("\n")
    .trim()
}
