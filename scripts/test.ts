import {
  createExecutionContext,
  getExecutionHelpers,
  instruction_functions,
} from "execute"
import path from "path"
import * as fs from "fs-extra"

async function main() {
  const ctx = createExecutionContext()
  ctx.context_prompt = "Finish Chatfile parser"
  // await instruction_functions.SUMMARIZE_FILES(
  //   ctx,
  //   {
  //     instruction_type: "SUMMARIZE_FILES",
  //     read_dir: "./static-src",
  //     dest_summary_file: "/prompt/file-summary.txt",
  //     _debug_output_dir: "/debug/file-summaries",
  //   },
  //   await getExecutionHelpers()
  // )
  await instruction_functions.BREAKDOWN_TASK(
    ctx,
    {
      instruction_type: "BREAKDOWN_TASK",
      read_dir: "./static-src",
      _debug_output_dir: "/debug/task-breakdown",
    },
    await getExecutionHelpers()
  )

  await fs.remove("./debug")
  // console.log(ctx.vfs)
  for (const [file_path, content] of Object.entries(ctx.vfs)) {
    await fs.mkdirp(path.join("./debug", path.dirname(file_path)))
    await fs.writeFile(path.join("./debug", file_path), content)
  }
}

main()

export {}
