export type VirtualFileSystem = Record<string, string>

export interface ExecutionContext {
  host_root_dir: string
  vfs: VirtualFileSystem
  engine: string
  token_limit: number
  context_prompt?: string
  objective_prompt?: string
}

export const createExecutionContext = ({
  host_root_dir,
}: {
  host_root_dir?: string
} = {}): ExecutionContext => {
  if (!host_root_dir) {
    host_root_dir = process.cwd()
  }

  return {
    host_root_dir,
    vfs: {},
    engine: "gpt-3.5-turbo",
    token_limit: 4000,
  }
}
