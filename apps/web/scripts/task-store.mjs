import fs from "node:fs/promises"
import path from "node:path"

const appRoot = process.cwd()
const tasksDir = path.join(appRoot, "tasks")
const publicDir = path.join(appRoot, "public")
const generatedDir = path.join(publicDir, "generated")
const manifestPath = path.join(generatedDir, "tasks-manifest.json")

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function rimraf(dir) {
  await fs.rm(dir, { recursive: true, force: true })
}

async function copyDir(source, destination) {
  await ensureDir(destination)
  const entries = await fs.readdir(source, { withFileTypes: true })
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)
    if (entry.isDirectory()) {
      await copyDir(sourcePath, destinationPath)
    } else {
      await fs.copyFile(sourcePath, destinationPath)
    }
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function readJsonIfExists(filePath) {
  if (!(await fileExists(filePath))) {
    return null
  }

  return JSON.parse(await fs.readFile(filePath, "utf8"))
}

function slugifyTaskName(input) {
  const baseName = input.replace(/\.[^.]+$/, "")
  const slug = baseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || "task"
}

function extensionForUpload(fileName, mimeType) {
  const explicit = path.extname(fileName).toLowerCase()
  if (explicit) {
    return explicit
  }

  switch (mimeType) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/gif":
      return ".gif"
    case "image/svg+xml":
      return ".svg"
    default:
      return ".img"
  }
}

async function findSourceFile(taskDir) {
  const entries = await fs.readdir(taskDir, { withFileTypes: true })
  const sourceEntry = entries.find((entry) => entry.isFile() && /^source\./.test(entry.name))
  return sourceEntry ? sourceEntry.name : null
}

export async function syncTasksManifest() {
  await ensureDir(generatedDir)
  await rimraf(path.join(generatedDir, "tasks"))
  await ensureDir(path.join(generatedDir, "tasks"))

  const manifest = []
  const taskEntries = await fs.readdir(tasksDir, { withFileTypes: true })

  for (const entry of taskEntries) {
    if (!entry.isDirectory()) {
      continue
    }

    const taskDir = path.join(tasksDir, entry.name)
    const taskJsonPath = path.join(taskDir, "task.json")
    const targetDir = path.join(generatedDir, "tasks", entry.name)
    await ensureDir(targetDir)
    const task = (await readJsonIfExists(taskJsonPath)) ?? {}
    const taskId = task.id ?? entry.name
    const taskName = task.name ?? entry.name
    const taskStatus = task.status ?? "ready"
    const createdAt = task.createdAt ?? new Date().toISOString()
    const sourceFileName = await findSourceFile(taskDir)
    const sourcePath = sourceFileName ? path.join(taskDir, sourceFileName) : null
    const previewDir = path.join(taskDir, "preview")
    const previewIndexPath = path.join(previewDir, "index.html")
    const skillsJsonPath = path.join(taskDir, "skills.json")
    const skillsTxtPath = path.join(taskDir, "skills.txt")
    const hasSource = sourcePath ? await fileExists(sourcePath) : false
    const hasPreview = await fileExists(previewIndexPath)
    const hasSkillsJson = await fileExists(skillsJsonPath)
    const hasSkillsTxt = await fileExists(skillsTxtPath)

    if (!(hasSource || hasPreview || hasSkillsJson || hasSkillsTxt || (await fileExists(taskJsonPath)))) {
      continue
    }

    if (hasSource) {
      await fs.copyFile(sourcePath, path.join(targetDir, sourceFileName))
    }

    if (hasPreview) {
      await copyDir(previewDir, path.join(targetDir, "preview"))
    }

    if (hasSkillsJson) {
      await fs.copyFile(skillsJsonPath, path.join(targetDir, "skills.json"))
    } else if (hasSkillsTxt) {
      await fs.copyFile(skillsTxtPath, path.join(targetDir, "skills.txt"))
    }

    const skills =
      (await readJsonIfExists(skillsJsonPath)) ??
      (hasSkillsTxt
        ? {
            artifactPaths: (await fs.readFile(skillsTxtPath, "utf8"))
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          }
        : null)

    manifest.push({
      id: taskId,
      name: taskName,
      status: taskStatus,
      createdAt,
      sourceImageUrl: hasSource ? `/generated/tasks/${entry.name}/${sourceFileName}` : null,
      previewUrl: hasPreview ? `/generated/tasks/${entry.name}/preview/index.html` : null,
      skillArtifacts: skills?.artifactPaths ?? [],
      skillsUrl: hasSkillsJson
        ? `/generated/tasks/${entry.name}/skills.json`
        : hasSkillsTxt
          ? `/generated/tasks/${entry.name}/skills.txt`
          : null,
    })
  }

  await fs.writeFile(manifestPath, JSON.stringify({ tasks: manifest }, null, 2))
  return manifest
}

export async function createTaskFromUpload({ fileName, mimeType, bytes }) {
  if (!mimeType.startsWith("image/")) {
    throw new Error("Only image uploads are supported")
  }

  await ensureDir(tasksDir)

  const createdAt = new Date().toISOString()
  const taskSlug = `${slugifyTaskName(fileName)}-${Date.now()}`
  const taskId = taskSlug
  const taskDir = path.join(tasksDir, taskSlug)
  const sourceExtension = extensionForUpload(fileName, mimeType)
  const sourceFileName = `source${sourceExtension}`

  await ensureDir(taskDir)
  await fs.writeFile(path.join(taskDir, sourceFileName), bytes)
  await fs.writeFile(
    path.join(taskDir, "task.json"),
    JSON.stringify(
      {
        id: taskId,
        name: fileName,
        status: "queued",
        createdAt,
      },
      null,
      2,
    ),
  )

  await syncTasksManifest()

  return {
    id: taskId,
    name: fileName,
    status: "queued",
    createdAt,
    imageUrl: `/generated/tasks/${taskSlug}/${sourceFileName}`,
    previewUrl: null,
    skillArtifacts: [],
    skillsUrl: null,
  }
}
