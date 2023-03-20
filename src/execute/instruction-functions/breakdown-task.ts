import { getFullDirectorySummary } from "./../../openai/get-full-directory-summary"
import { ExecutionHelpers } from "execute/execution-helpers"
import { ExecutionContext } from "execute/execution-context"
import { BreakdownTaskInstruction } from "types/instruction"
import { getVirtualFileSystemFromDirPath } from "make-vfs"

export const BREAKDOWN_TASK = async (
  context: ExecutionContext,
  instruction: BreakdownTaskInstruction,
  helpers: ExecutionHelpers
) => {
  helpers.configureDebug(context, instruction._debug_output_dir)

  const context_prompt =
    context.context_prompt ?? context.objective_prompt ?? ""
  const { _debug_output_dir, read_dir } = instruction
  const { engine } = context

  const target_vfs = (await getVirtualFileSystemFromDirPath({
    dirPath: read_dir,
    contentFormat: "string",
  })) as Record<string, string>

  const full_summary_file = await getFullDirectorySummary(
    {
      vfs: target_vfs,
      engine,
      context_prompt,
    },
    helpers
  )

  const task_breakdown_files_res = await helpers.getCachedPrompt(
    context.engine,
    `What files would you need to look at to describe how to implement the following task in more detail, including specific files (include full path) that might be needed. Do not mention directories broadly.\n\nTask:\n${context_prompt}\n\nDirectory Summary Before Edit:\n${full_summary_file}`
  )

  helpers.logDebugFile("task-breakdown-files.txt", task_breakdown_files_res)

  const task_breakdown_files_json_res = await helpers.getCachedPrompt(
    context.engine,
    `Convert the following task breakdown file paths to JSON in the format Array<{"file_path": string}>:\n\n${task_breakdown_files_res}`
  )

  const task_breakdown_files = await JSON.parse(task_breakdown_files_json_res)

  const file_structures = await Promise.all(
    task_breakdown_files.map(async ({ file_path }: any) => {
      const file_structure_res = await helpers.getCachedPrompt(
        engine,
        `Briefly describe the structure of this file. Be exact about it's interfaces or API, if it has any.\n\n${target_vfs[file_path]})`
      )
      helpers.logDebugFile(`${file_path}.structure.txt`, file_structure_res)
      return [file_path, file_structure_res]
    })
  )

  helpers.logDebugFile(
    "task-breakdown-prompt.txt",
    `Break down the following task into specific subtasks in more detail. Be precise and mention any file needed. Each subtask should be in the format:\n  MODIFICATION TO MAKE:\n  FILES NEEDED FOR CONTEXT:\n  FILE TO MODIFY:\n\nTask:\n${context_prompt}\n\nFile Summaries:\n${file_structures
      .map(
        ([file_path, file_structure]: any) => `${file_path}:\n${file_structure}`
      )
      .join("\n\n")}`
  )

  const task_breakdown_with_context = await helpers.getCachedPrompt(
    context.engine,
    `Break down the following task into specific subtasks in more detail. Be precise and mention any file needed. Each subtask should be in the format:\n  MODIFICATION TO MAKE:\n  FILES NEEDED FOR CONTEXT:\n  FILE TO MODIFY:\n\nTask:\n${context_prompt}\n\nFile Summaries:\n${file_structures
      .map(
        ([file_path, file_structure]: any) => `${file_path}:\n${file_structure}`
      )
      .join("\n\n")}`
  )

  helpers.logDebugFile(
    "task-breakdown-with-context.txt",
    task_breakdown_with_context
  )

  const task_breakdown_with_context_json_res = await helpers.getCachedPrompt(
    context.engine,
    `Convert the following task breakdown with context to JSON in the format Array<{modification: string, context_files: Array<string>, file_to_modify: string}>:\n\n${task_breakdown_with_context}`
  )

  helpers.logDebugFile(
    "task-breakdown-with-context.json",
    task_breakdown_with_context_json_res
  )

  const task_breakdown = JSON.parse(task_breakdown_with_context_json_res)
}
