import React from 'react'
import { FileText, AlignLeft } from 'lucide-react'

export default function FileItem({ file, isSelected, isFocused, onClick }) {
  const paddingLeft = 12 + file.depth * 14
  const depthOpacity = Math.max(0.5, 0.85 - file.depth * 0.12)

  const guides = []
  for (let i = 1; i <= file.depth; i++) {
    guides.push(
      <div
        key={i}
        className="absolute top-0 bottom-0 w-px bg-border-strong"
        style={{ left: `${14 + (i - 1) * 14}px`, opacity: 0.5 }}
      />
    )
  }

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-2 py-1.5 pr-3 cursor-pointer transition-all duration-150
        border-l-2
        ${isSelected
          ? 'border-l-accent bg-accent-soft'
          : isFocused
            ? 'border-l-transparent bg-accent-softer'
            : 'border-l-transparent hover:bg-accent-softer'
        }
      `}
      style={{ paddingLeft: `${paddingLeft}px` }}
    >
      {guides}
      {file.extension === '.md' ? (
        <FileText size={14} className="text-file-md flex-shrink-0" />
      ) : (
        <AlignLeft size={14} className="text-file-txt flex-shrink-0" />
      )}
      <span
        className={`text-sm truncate ${isSelected ? 'text-text-primary font-semibold' : 'font-normal'}`}
        style={{ color: isSelected ? undefined : `var(--text-secondary)`, opacity: isSelected ? 1 : depthOpacity }}
      >
        {file.name}
      </span>
    </div>
  )
}
