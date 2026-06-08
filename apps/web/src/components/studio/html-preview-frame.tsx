import type { StudioTask } from "../../pages/studio/page"

type HtmlPreviewFrameProps = {
  task: StudioTask | null
}

export function HtmlPreviewFrame({ task }: HtmlPreviewFrameProps) {
  if (!task) {
    return <div className="preview-empty">Select or upload a task to inspect the generated HTML output.</div>
  }

  if (!task.previewUrl) {
    return <div className="preview-empty">This task does not have a generated HTML result yet.</div>
  }

  return (
    <div className="preview-stack">
      <div className="preview-meta">
        <div>
          <p className="eyebrow">Selected Task</p>
          <strong>{task.name}</strong>
        </div>
        <span className="status-chip">{task.status}</span>
      </div>
      <div className="resource-grid">
        <div className="resource-card">
          <p className="eyebrow">Image URL</p>
          {task.imageUrl ? (
            <>
              <a className="resource-link" href={task.imageUrl} target="_blank" rel="noreferrer">
                {task.imageUrl}
              </a>
              <a className="resource-action" href={task.imageUrl} download>
                Download Image
              </a>
            </>
          ) : (
            <span className="resource-empty">No source image URL</span>
          )}
        </div>
        <div className="resource-card">
          <p className="eyebrow">Generated HTML URL</p>
          <a className="resource-link" href={task.previewUrl} target="_blank" rel="noreferrer">
            {task.previewUrl}
          </a>
          <a className="resource-action" href={task.previewUrl} target="_blank" rel="noreferrer">
            Open HTML
          </a>
        </div>
        <div className="resource-card">
          <p className="eyebrow">Skill Artifacts</p>
          {task.skillArtifacts.length > 0 ? (
            <>
              <div className="resource-path-list">
                {task.skillArtifacts.map((artifactPath) => (
                  <code key={artifactPath} className="resource-path">
                    {artifactPath}
                  </code>
                ))}
              </div>
              {task.skillsUrl ? (
                <a className="resource-action" href={task.skillsUrl} target="_blank" rel="noreferrer">
                  Open Skills File
                </a>
              ) : null}
            </>
          ) : task.skillsUrl ? (
            <a className="resource-link" href={task.skillsUrl} target="_blank" rel="noreferrer">
              {task.skillsUrl}
            </a>
          ) : (
            <span className="resource-empty">No skill artifact paths</span>
          )}
        </div>
      </div>
      <iframe className="preview-frame" src={task.previewUrl} title={`Preview for ${task.name}`} />
    </div>
  )
}
