import { ExecutionContext } from "execute/execution-context"
import { ExecutionHelpers } from "execute/execution-helpers"
import { SummarizeFilesInstruction } from "types/instruction"
import { getVirtualFileSystemFromDirPath } from "make-vfs"
import { getSentenceFileSummary } from "openai/get-sentence-file-summary"

/**
 * Produce a simple summary of all the files in a directory in this format:
 *
 * file_path: one sentence summary of file relating to context prompt
 *
 */
export const CREATE_FILE_SUMMARY_INDEX = async (
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
  let summary_file = ""
  for (const [file_path, file_content] of Object.entries(target_vfs)) {
    const summary = await getSentenceFileSummary(
      {
        file: file_content as string,
        engine: context.engine,
        context_prompt,
      },
      helpers
    )
    if (_debug_output_dir) {
      context.vfs[`${_debug_output_dir}/${file_path}.summary.txt`] = summary
    }
    summary_file += `${file_path}: ${summary}\n`
  }
  summary_file = summary_file.trim()
  context.vfs[dest_summary_file] = summary_file
}
