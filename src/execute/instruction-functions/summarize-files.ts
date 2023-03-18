import { ExecutionContext } from "execute/execution-context"
import { LoadFilesInstruction } from "types/instruction"

export const SUMMARIZE_FILES = async (
  context: ExecutionContext,
  instruction: LoadFilesInstruction,
  helpers: ExecutionHelpers
) => {
  const token_limit = instruction.token_limit ?? context.token_limit
  const { target_dir, dest_file } = instruction
}
