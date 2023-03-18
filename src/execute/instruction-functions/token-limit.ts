import { ExecutionContext } from "execute/execution-context"
import { EngineInstruction } from "types/instruction"

export const TOKEN_LIMIT = async (
  ctx: ExecutionContext,
  instruction: EngineInstruction
) => {
  ctx.engine = instruction.engine
}
