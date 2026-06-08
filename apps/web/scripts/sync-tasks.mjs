import { syncTasksManifest } from "./task-store.mjs"

async function main() {
  await syncTasksManifest()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
