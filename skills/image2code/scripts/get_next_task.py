#!/usr/bin/env python3

from __future__ import annotations

import json
import os
from pathlib import Path


def find_repo_root(start: Path) -> Path | None:
    for current in [start, *start.parents]:
        if (current / "apps" / "web" / "tasks").exists():
            return current
    return None


def load_task(task_dir: Path, repo_root: Path) -> dict:
    task_file = task_dir / "task.json"
    task = json.loads(task_file.read_text()) if task_file.exists() else {}
    task_name = task_dir.name
    return {
        "id": task.get("id", task_name),
        "name": task.get("name", task_name),
        "status": task.get("status", "ready"),
        "createdAt": task.get("createdAt"),
        "taskDir": str(task_dir.relative_to(repo_root)),
        "sourcePath": str((task_dir / "source.png").relative_to(repo_root)),
        "previewPath": str((task_dir / "preview" / "index.html").relative_to(repo_root)),
        "skillsPath": str((task_dir / "skills.json").relative_to(repo_root)),
    }


def main() -> int:
    cwd = Path(os.getcwd()).resolve()
    repo_root = find_repo_root(cwd)
    if repo_root is None:
        print(json.dumps({"error": "could not find apps/web/tasks from current directory"}))
        return 1

    tasks_dir = repo_root / "apps" / "web" / "tasks"
    if not tasks_dir.exists():
        print(json.dumps({"error": "tasks directory not found"}))
        return 1

    tasks = []
    for task_dir in sorted(tasks_dir.iterdir()):
        if not task_dir.is_dir():
            continue
        if not ((task_dir / "source.png").exists() or (task_dir / "preview" / "index.html").exists()):
            continue
        tasks.append(load_task(task_dir, repo_root))

    queued = [task for task in tasks if task.get("status") in {"queued", "running", "ready"}]
    result = queued[0] if queued else None
    print(json.dumps({"task": result, "count": len(tasks)}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
