import { ExecutionContext } from "execute/execution-context"
import { ExecutionHelpers } from "execute/execution-helpers"
import { SummarizeFilesInstruction } from "types/instruction"
import { getVirtualFileSystemFromDirPath } from "make-vfs"
import { getSentenceFileSummary } from "openai/get-sentence-file-summary"

/**
 * Produce a summary containing the most important parts of the most relevant
 * files for a given task.
 *
 * 1. Load the target files into the virtual file system
 * 2. Using the context prompt, summarize each file by purpose.
 * 3. Using the context prompt with all summarizations, select the relevant
 *    files.
 * 4. Reduce each file to it's "essence" or meaningful patterns
 * 5. Write the summary to the destination fil
 */
export const SUMMARIZE_FILES = async (
  context: ExecutionContext,
  instruction: SummarizeFilesInstruction,
  helpers: ExecutionHelpers
) => {
  const token_limit = instruction.token_limit ?? context.token_limit
  const context_prompt = context.context_prompt ?? context.objective_prompt
  const { read_dir, dest_summary_file, _debug_output_dir } = instruction

  const target_vfs = await getVirtualFileSystemFromDirPath({
    dirPath: read_dir,
    contentFormat: "string",
  })

  // For each file, summarize the content according to the prompt
  const file_summary_lines: Array<string> = []
  const $summaries = []
  for (const [file_path, file_content] of Object.entries(target_vfs)) {
    $summaries.push(
      (async () => {
        const summary = await getSentenceFileSummary(
          {
            file: file_content as string,
            engine: context.engine,
            context_prompt,
          },
          helpers
        )
        if (_debug_output_dir) {
          context.vfs[
            `${_debug_output_dir}/file-summaries/${file_path}.summary.txt`
          ] = summary
        }
        file_summary_lines.push(`${file_path}: ${summary}\n`)
      })()
    )
  }
  await Promise.all($summaries)
  const full_summary_file = file_summary_lines.sort().join("\n").trim()

  if (_debug_output_dir) {
    context.vfs[`${_debug_output_dir}/full-summary.txt`] = full_summary_file
  }

  // Select the most relevant files
  const most_relevant_files_res = await helpers.getCachedPrompt(
    context.engine,
    `Select the most relevant files to complete the task from the full directory summary.\n\nTask:${context_prompt} \n\n:\n\nFile Directory Summary:\n${full_summary_file}`
  )

  if (_debug_output_dir) {
    context.vfs[`${_debug_output_dir}/most-relevant-files.txt`] =
      most_relevant_files_res
  }

  const json_most_relevant_files_res = await helpers.getCachedPrompt(
    context.engine,
    `Can you convert this output into a JSON array matching the following type Array<{ file_path: string }>:\n${most_relevant_files_res}`
  )

  const most_relevant_files = JSON.parse(json_most_relevant_files_res).map(
    (a: any) => a.file_path
  )

  // Extract the most meaningful parts of each file for completion of the
  const meaningful_parts_of_files = []
  const $meaningful_parts = most_relevant_files.map(
    async (file_path: string) => {
      return [
        file_path,
        await helpers.getCachedPrompt(
          context.engine,
          `What are the most important sections of the file below to answer the following prompt?\n\nPrompt:\n${context_prompt}\n\nFile:\n${target_vfs[file_path]}`
        ),
      ]
    }
  )
  const meaningful_parts = await Promise.all($meaningful_parts)

  // helpers.getCachedPrompt(
}
