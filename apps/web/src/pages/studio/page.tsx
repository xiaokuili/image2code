import { useEffect, useMemo, useState } from "react"
import { AppShell } from "../../components/shared/app-shell"
import { HtmlPreviewFrame } from "../../components/studio/html-preview-frame"
import { ImageDropzone } from "../../components/studio/image-dropzone"
import { TaskList } from "../../components/studio/task-list"

export type TaskStatus = "queued" | "running" | "ready"

export type StudioTask = {
  id: string
  name: string
  createdAt: string
  status: TaskStatus
  imageUrl: string | null
  previewUrl: string | null
  skillArtifacts: string[]
  skillsUrl: string | null
}

export function StudioPage() {
  const [tasks, setTasks] = useState<StudioTask[]>([])
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTasks() {
      const response = await fetch("/generated/tasks-manifest.json")
      const data = (await response.json()) as {
        tasks: Array<{
          id: string
          name: string
          status: TaskStatus
          createdAt: string
          sourceImageUrl: string | null
          previewUrl: string | null
          skillArtifacts?: string[]
          skillsUrl?: string | null
        }>
      }

      if (cancelled) {
        return
      }

      setTasks(
        data.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          status: task.status,
          createdAt: task.createdAt,
          imageUrl: task.sourceImageUrl,
          previewUrl: task.previewUrl,
          skillArtifacts: task.skillArtifacts ?? [],
          skillsUrl: task.skillsUrl ?? null,
        })),
      )
      setSelectedTaskId((current) => current ?? data.tasks[0]?.id ?? null)
    }

    void loadTasks().catch((error) => {
      console.error(error)
      if (!cancelled) {
        setUploadError("Failed to load tasks.")
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null,
    [selectedTaskId, tasks],
  )

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ""

      for (const byte of bytes) {
        binary += String.fromCharCode(byte)
      }

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          dataBase64: btoa(binary),
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        task?: StudioTask
      }

      if (!response.ok || !payload.task) {
        throw new Error(payload.error ?? "Failed to create task")
      }

      setTasks((current) => [payload.task!, ...current])
      setSelectedTaskId(payload.task.id)
    } catch (error) {
      console.error(error)
      setUploadError(error instanceof Error ? error.message : "Failed to create task")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <AppShell>
      <section className="panel panel-upload">
        <div className="panel-header">
          <p className="eyebrow">Create Task</p>
          <h2>Upload Image</h2>
        </div>
        <ImageDropzone onUpload={handleUpload} />
        {isUploading ? <p className="upload-hint">Creating local task...</p> : null}
        {uploadError ? <p className="upload-error">{uploadError}</p> : null}
      </section>

      <section className="studio-list-layout">
        <div className="panel">
          <div className="panel-header">
            <p className="eyebrow">Tasks</p>
            <h2>All Uploaded Jobs</h2>
          </div>
          <TaskList tasks={tasks} selectedTaskId={selectedTask?.id ?? null} onSelect={setSelectedTaskId} />
        </div>

        <div className="panel panel-preview">
          <div className="panel-header">
            <p className="eyebrow">Result</p>
            <h2>Generated HTML</h2>
          </div>
          <HtmlPreviewFrame task={selectedTask} />
        </div>
      </section>
    </AppShell>
  )
}
