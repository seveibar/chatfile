export type EngineInstruction = {
  instruction_type: "ENGINE"
  engine: string
}

export type TokenLimitInstruction = {
  instruction_type: "TOKEN_LIMIT"
  token_limit: number
}

export type LoadDirectoryInstruction = {
  instruction_type: "LOAD_DIRECTORY"
  host_directory: string
  dest_directory: string
}

export type SummarizeDirectoryInstruction = {
  instruction_type: "SUMMARIZE_DIRECTORY"
  summary_target: string
  dest_file: string
}

export type FindReleventFilesInstruction = {
  instruction_type: "FIND_RELEVANT_FILES"
  summary_target: string
  dest_file: string
}

export type LoadFilesInstruction = {
  instruction_type: "LOAD_FILES"
  target_dir: string
  dest_file: string
}

export type SummarizeFilesInstruction = {
  instruction_type: "SUMMARIZE_FILES"
  target_dir: string
  dest_file: string
  token_limit?: number
}

export type Instruction =
  | EngineInstruction
  | TokenLimitInstruction
  | LoadDirectoryInstruction
  | SummarizeDirectoryInstruction
  | FindReleventFilesInstruction
  | LoadFilesInstruction

export type InstructionType = Instruction["instruction_type"]
