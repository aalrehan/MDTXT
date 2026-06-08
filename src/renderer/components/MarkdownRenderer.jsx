import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { Copy, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import HighlightableViewer from './HighlightableViewer'

function CustomCodeBlock({ node, inline, className, children, ...props }) {
  const [copied, setCopied] = useState(false)

  if (inline) {
    return (
      <code className="bg-code-inline rounded px-1.5 py-0.5 text-sm font-mono text-text-primary" {...props}>
        {children}
      </code>
    )
  }

  const match = /language-(\w+)/.exec(className || '')
  const language = match ? match[1] : ''
  const codeString = String(children).replace(/\n$/, '')

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group mb-4">
      {language && (
        <div className="absolute top-0 right-2 text-[10px] text-text-muted bg-bg-sidebar px-2 py-1 rounded-b-md font-mono uppercase tracking-wider">
          {language}
        </div>
      )}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-bg-sidebar hover:bg-border-strong text-text-muted hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all duration-150"
        title="Copy code"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre
        className="bg-bg-code rounded-lg p-4 overflow-x-auto border border-border-subtle"
        style={{ boxShadow: 'var(--code-block-shadow)' }}
      >
        <code className={`language-${language}`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  )
}

function CustomImage({ src, alt }) {
  const { selectedFile } = useApp()

  let imageSrc = src

  if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('local-files://')) {
    if (selectedFile) {
      const lastSlash = Math.max(
        selectedFile.path.lastIndexOf('/'),
        selectedFile.path.lastIndexOf('\\')
      )
      const fileDir = lastSlash > 0 ? selectedFile.path.substring(0, lastSlash) : ''
      const sep = selectedFile.path.includes('\\') ? '\\' : '/'
      const absolutePath = fileDir + sep + src
      imageSrc = 'local-files://' + encodeURIComponent(absolutePath)
    }
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className="max-w-full rounded-lg my-4 border border-border-subtle"
      style={{ maxHeight: '400px' }}
    />
  )
}

export default function MarkdownRenderer({ content, themeClass }) {
  const { zoomLevel, selectedFile } = useApp()
  const isDark = themeClass !== 'theme-light'

  return (
    <HighlightableViewer filePath={selectedFile?.path}>
      <div
        className={`mdt-prose max-w-none p-8 ${isDark ? 'prose prose-invert' : 'prose'}`}
        style={{ fontSize: zoomLevel + '%' }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            code: CustomCodeBlock,
            img: CustomImage
          }}
        >
          {content || ''}
        </ReactMarkdown>
      </div>
    </HighlightableViewer>
  )
}
