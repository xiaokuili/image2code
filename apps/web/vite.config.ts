import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { createTaskFromUpload, syncTasksManifest } from "./scripts/task-store.mjs"

export default defineConfig({
  plugins: [
    react(),
    {
      name: "local-task-api",
      configureServer(server) {
        server.middlewares.use("/api/tasks", async (req, res) => {
          if (req.method === "GET") {
            await syncTasksManifest()
            res.setHeader("Content-Type", "application/json")
            res.end(await server.transformIndexHtml("/api/tasks", JSON.stringify({ ok: true })))
            return
          }

          if (req.method !== "POST") {
            res.statusCode = 405
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ error: "Method not allowed" }))
            return
          }

          try {
            const chunks = []
            for await (const chunk of req) {
              chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
            }

            const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
              fileName?: string
              mimeType?: string
              dataBase64?: string
            }

            if (!body.fileName || !body.mimeType || !body.dataBase64) {
              res.statusCode = 400
              res.setHeader("Content-Type", "application/json")
              res.end(JSON.stringify({ error: "Missing upload payload" }))
              return
            }

            const task = await createTaskFromUpload({
              fileName: body.fileName,
              mimeType: body.mimeType,
              bytes: Buffer.from(body.dataBase64, "base64"),
            })

            res.statusCode = 201
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({ task }))
          } catch (error) {
            res.statusCode = 500
            res.setHeader("Content-Type", "application/json")
            res.end(
              JSON.stringify({
                error: error instanceof Error ? error.message : "Failed to create task",
              }),
            )
          }
        })
      },
    },
  ],
})
