import {
  Instruction,
  EngineInstruction,
  TokenLimitInstruction,
  LoadDirectoryInstruction,
  SummarizeDirectoryInstruction,
  FindReleventFilesInstruction,
  LoadFilesInstruction,
  BreakdownTaskInstruction,
  SummarizeFilesInstruction,
} from "types/instruction"

export const parseChatfile = async (
  chatfile: string
): Promise<Instruction[]> => {
  const lines = chatfile
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
  const instructions: Instruction[] = []

  for (const line of lines) {
    if (line.startsWith("ENGINE")) {
      const engine = line.split(" ")[1]
      const instruction: EngineInstruction = {
        instruction_type: "ENGINE",
        engine,
      }
      instructions.push(instruction)
    } else if (line.startsWith("TOKEN_LIMIT")) {
      const token_limit = parseInt(line.split(" ")[1], 10)
      const instruction: TokenLimitInstruction = {
        instruction_type: "TOKEN_LIMIT",
        token_limit,
      }
      instructions.push(instruction)
    } else if (line.startsWith("LOAD_DIRECTORY")) {
      const [host_directory, dest_directory] = line.split(" ").slice(1)
      const instruction: LoadDirectoryInstruction = {
        instruction_type: "LOAD_DIRECTORY",
        host_directory,
        dest_directory,
      }
      instructions.push(instruction)
    } else if (line.startsWith("SUMMARIZE_DIRECTORY")) {
      const [summary_target, dest_file] = line.split(" ").slice(1)
      const instruction: SummarizeDirectoryInstruction = {
        instruction_type: "SUMMARIZE_DIRECTORY",
        summary_target,
        dest_file,
      }
      instructions.push(instruction)
    } else if (line.startsWith("FIND_RELEVANT_FILES")) {
      const [summary_target, dest_file] = line.split(" ").slice(1)
      const instruction: FindReleventFilesInstruction = {
        instruction_type: "FIND_RELEVANT_FILES",
        summary_target,
        dest_file,
      }
      instructions.push(instruction)
    } else if (line.startsWith("LOAD_FILES")) {
      const [target_dir, dest_file] = line.split(" ").slice(1)
      const instruction: LoadFilesInstruction = {
        instruction_type: "LOAD_FILES",
        target_dir,
        dest_file,
      }
      instructions.push(instruction)
    } else if (line.startsWith("BREAKDOWN_TASK")) {
      const [read_dir] = line.split(" ").slice(1)
      const instruction: BreakdownTaskInstruction = {
        instruction_type: "BREAKDOWN_TASK",
        read_dir,
      }
      instructions.push(instruction)
    } else if (line.startsWith("SUMMARIZE_FILES")) {
      const [read_dir, dest_summary_file] = line.split(" ").slice(1)
      const instruction: SummarizeFilesInstruction = {
        instruction_type: "SUMMARIZE_FILES",
        read_dir,
        dest_summary_file,
      }
      instructions.push(instruction)
    }
  }

  return instructions
}
