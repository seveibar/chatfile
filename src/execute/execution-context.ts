export type VirtualFileSystem = Record<string, string>

export interface ExecutionContext {
  vfs: VirtualFileSystem
  engine: string
  token_limit: number
}

export const createExecutionContext = (): ExecutionContext => {
  return {
    vfs: {},
    engine: "gpt3.5-turbo",
    token_limit: 4000,
  }
}
