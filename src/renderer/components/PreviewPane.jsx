import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MarkdownRenderer from './MarkdownRenderer'
import PlainTextViewer from './PlainTextViewer'
import EmptyState from './EmptyState'
import { useApp } from '../context/AppContext'

export default function PreviewPane() {
  const { selectedFile, fileContent, fileError } = useApp()
  const [themeClass, setThemeClass] = useState('theme-dark')

  useEffect(() => {
    const update = () => {
      setThemeClass(document.documentElement.classList.contains('theme-light') ? 'theme-light' : 'theme-dark')
    }
    update()
    const handler = () => update()
    window.addEventListener('mdtxt:theme-change', handler)
    return () => window.removeEventListener('mdtxt:theme-change', handler)
  }, [])

  if (!selectedFile) {
    return <EmptyState message="Select a file to preview" icon="file" />
  }

  if (fileError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-primary">
        <div className="text-center max-w-md px-6">
          <p className="text-text-secondary text-base mb-2">Could not load this file</p>
          <p className="text-text-muted text-sm">{fileError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto bg-bg-primary transition-colors duration-200">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFile.path}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {selectedFile.extension === '.md' ? (
            <MarkdownRenderer content={fileContent} themeClass={themeClass} />
          ) : (
            <PlainTextViewer content={fileContent} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
