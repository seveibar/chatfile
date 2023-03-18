import { ExecutionContext } from "execute/execution-context"
import { ExecutionHelpers } from "execute/execution-helpers"
import { SummarizeFilesInstruction } from "types/instruction"
import { getVirtualFileSystemFromDirPath } from "make-vfs"
import { getSentenceFileSummary } from "openai/get-sentence-file-summary"

/**
 * Summarizing files is a three-step process:
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
