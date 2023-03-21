import { createExecutionContext, getExecutionHelpers } from "execute"
import { getVirtualFileSystemFromDirPath } from "make-vfs"

async function main() {
  const ctx = createExecutionContext()
  const h = await getExecutionHelpers()

  const vfs = await getVirtualFileSystemFromDirPath({
    dirPath: "./",
    contentFormat: "string",
  })

  for (const k in vfs) {
    vfs[`/${k}`] = vfs[k]
    delete vfs[k]
  }

  const top_prompt = `
  You are a program designed to complete tasks. You MUST only output commands. You must use the commands to determine how to complete the task. Do not output anything except commands. Do not explain your answers. Execute one command at a time. Only ever respond in a single line. Be very careful to ensure your solution is correct.

  Task: Add support for named parameters within chatfiles.
  
  You can only output the following commands:
  "ls <path>": List the files at the specified path
  "read <path>": Print the file at the specified path
  "write <path> <line number> <content>": Write to the file at path at the specified line, creating it if it doesn't exist.
  
  Recommendation: Start with "ls /"
  `.trim()

  function executeResponse(res) {
    if (res.trim().includes("\n")) {
      return "Error: only one command per line"
    }
    const cmd = res.split(" ")[0]
    let args = res.split(" ").slice(1).join(" ")
    switch (cmd) {
      case "ls": {
        return (
          Array.from(
            new Set(
              Object.keys(vfs)
                .filter((path) => path.startsWith(args))
                .map((path) => path.split(args)[1].split("/")[1])
            )
          ).join("\n") || "<empty>"
        )
      }
      case "read": {
        if (!args.startsWith("/")) {
          args = "/" + args
        }
        if (vfs[args]) {
          return vfs[args]
        }
        return "Error: file not found"
      }
      case "write": {
        const [path, line] = args.split(" ")
        const content = args.split(" ").slice(2).join(" ")
        const new_file_content = ((vfs[path] as string) ?? "").split("\n")
        new_file_content[line] = content
        vfs[path] = new_file_content.join("\n")
        return "OK"
      }
    }
    throw new Error(`Invalid command: ${cmd}`)
  }

  console.log(executeResponse("read /src/parse/parse-chatfile.ts"))
  return

  let history = ""
  const chat: any[] = []

  for (let i = 0; i < 10; i++) {
    const response = await h.openai.createChatCompletion({
      messages: [
        {
          role: "user",
          content: top_prompt,
        },
        ...chat,
      ],
      model: ctx.engine,
    })
    const res = response.data.choices?.[0]?.message?.content.trim()
    chat.push({ role: "assistant", content: res })
    history += "\n > " + res
    console.log("\n> " + res)
    const exec_res = executeResponse(res)
    console.log(exec_res)
    if (!exec_res?.trim()) {
      throw new Error("No response")
    }
    chat.push({ role: "user", content: exec_res })
    history += "\n" + exec_res
  }
}

main()

export {}
