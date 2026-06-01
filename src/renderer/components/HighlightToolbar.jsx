import React from 'react'
import { motion } from 'framer-motion'
import { Highlighter, X } from 'lucide-react'

export default function HighlightToolbar({ mode, x, y, onAdd, onRemove }) {
  const clampedY = Math.max(8, y - 40)
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${clampedY}px`,
        transform: 'translateX(-50%)',
        zIndex: 100
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      {mode === 'add' ? (
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-gray-900 text-xs font-semibold transition-colors shadow-xl border border-amber-500/30"
        >
          <Highlighter size={14} />
          <span>Highlight</span>
        </button>
      ) : (
        <button
          onClick={onRemove}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-500/90 hover:bg-red-500 text-white text-xs font-semibold transition-colors shadow-xl border border-red-600/30"
        >
          <X size={14} />
          <span>Remove</span>
        </button>
      )}
    </motion.div>
  )
}
