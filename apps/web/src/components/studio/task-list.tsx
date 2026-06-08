import type { StudioTask } from "../../pages/studio/page"

type TaskListProps = {
  tasks: StudioTask[]
  selectedTaskId: string | null
  onSelect: (taskId: string) => void
}

export function TaskList({ tasks, selectedTaskId, onSelect }: TaskListProps) {
  if (tasks.length === 0) {
    return <div className="task-empty">No tasks yet. Upload an image to create the first job.</div>
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <button
          key={task.id}
          className={`task-card${selectedTaskId === task.id ? " is-active" : ""}`}
          onClick={() => onSelect(task.id)}
          type="button"
        >
          {task.imageUrl ? (
            <img className="task-thumb" src={task.imageUrl} alt={task.name} />
          ) : (
            <div className="task-thumb task-thumb-empty">No image</div>
          )}
          <div className="task-copy">
            <strong>{task.name}</strong>
            <span>{task.status}</span>
            <small>{new Date(task.createdAt).toLocaleString()}</small>
          </div>
        </button>
      ))}
    </div>
  )
}
