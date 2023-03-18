import {
  createExecutionContext,
  getExecutionHelpers,
  instruction_functions,
} from "execute"

async function main() {
  const ctx = createExecutionContext()
  await instruction_functions.SUMMARIZE_FILES(
    ctx,
    {
      instruction_type: "SUMMARIZE_FILES",
      read_dir: "./src",
      dest_summary_file: "/prompt/file-summary.txt",
      // _debug_output_dir: "/debug/file-summaries",
    },
    await getExecutionHelpers()
  )

  console.log("vfs", ctx.vfs)
}

main()

export {}
