import React from 'react'
import { FolderOpen, FileText, AlignLeft } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function EmptyState({ message, icon }) {
  const { rootFolderPath, files, setRootFolderPath } = useApp()

  const handleChooseFolder = async () => {
    const result = await window.electronAPI.chooseFolder()
    if (!result.canceled && result.filePaths.length > 0) {
      setRootFolderPath(result.filePaths[0])
    }
  }

  let showMessage = message
  let IconComponent = FolderOpen

  if (!rootFolderPath) {
    showMessage = 'Open a folder from the sidebar to start browsing'
    IconComponent = FolderOpen
  } else if (files.length === 0) {
    showMessage = 'No .md or .txt files found in this folder'
    IconComponent = FileText
  } else if (icon === 'file') {
    showMessage = message || 'Select a file to preview'
    IconComponent = AlignLeft
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-bg-primary transition-colors duration-200">
      <div className="text-center max-w-md px-6">
        <IconComponent size={42} className="mx-auto mb-5 text-text-muted opacity-50" />
        <p className="text-text-secondary text-base">{showMessage}</p>
        {!rootFolderPath && (
          <button
            onClick={handleChooseFolder}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-accent-soft text-sm transition-all duration-150"
          >
            <FolderOpen size={14} />
            <span>Choose Folder</span>
          </button>
        )}
      </div>
    </div>
  )
}
