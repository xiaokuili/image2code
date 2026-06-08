import { useRef } from "react"

type ImageDropzoneProps = {
  onUpload: (file: File) => void | Promise<void>
}

export function ImageDropzone({ onUpload }: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleFiles = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) {
      return
    }
    if (!file.type.startsWith("image/")) {
      return
    }
    onUpload(file)
  }

  return (
    <div
      className="dropzone"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        handleFiles(event.dataTransfer.files)
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        accept="image/*"
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
        type="file"
      />
      <div className="dropzone-copy">
        <strong>Drop an image here</strong>
        <span>or click to choose a file and create a task</span>
      </div>
    </div>
  )
}
