import type { PropsWithChildren } from "react"

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="app-shell">
      <header className="hero-strip">
        <div>
          <p className="eyebrow">TanStack + Cloudflare</p>
          <h1>Image2Code Studio</h1>
        </div>
        <p className="hero-copy">
          Upload a reference image, create a task, inspect the generated result, and keep the task list visible
          in a single workspace.
        </p>
      </header>
      {children}
    </main>
  )
}
