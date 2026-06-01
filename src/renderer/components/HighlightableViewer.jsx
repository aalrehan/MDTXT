import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import HighlightToolbar from './HighlightToolbar'
import { useApp } from '../context/AppContext'

const PREFIX_LEN = 24
const SUFFIX_LEN = 24
const MARK_CLASS = 'mdt-highlight'
const MARK_SELECTOR = 'mark.' + MARK_CLASS

function generateId() {
  return 'h_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}

function stripExistingHighlights(root) {
  const marks = root.querySelectorAll(MARK_SELECTOR)
  marks.forEach(mark => {
    const parent = mark.parentNode
    if (!parent) return
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
  })
  root.normalize()
}

function collectTextNodes(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      let p = node.parentNode
      while (p && p !== root) {
        const tag = p.nodeName
        if (tag === 'SCRIPT' || tag === 'STYLE' || (tag === 'MARK' && p.classList && p.classList.contains(MARK_CLASS))) {
          return NodeFilter.FILTER_REJECT
        }
        p = p.parentNode
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
  const nodes = []
  let n
  while ((n = walker.nextNode())) nodes.push(n)
  return nodes
}

function applyHighlightToRange(root, h) {
  const textNodes = collectTextNodes(root)
  if (textNodes.length === 0) return false

  let fullText = ''
  const nodeRanges = []
  for (const n of textNodes) {
    const start = fullText.length
    fullText += n.nodeValue
    nodeRanges.push({ node: n, start, end: fullText.length })
  }

  const needle = h.prefix + h.text + h.suffix
  const idx = fullText.indexOf(needle)
  if (idx === -1) return false

  const matchStart = idx + h.prefix.length
  const matchEnd = matchStart + h.text.length

  let first = null
  let last = null
  for (const r of nodeRanges) {
    if (r.end <= matchStart) continue
    if (r.start >= matchEnd) break
    if (!first) first = r
    last = r
  }
  if (!first || !last) return false

  const range = document.createRange()
  range.setStart(first.node, Math.max(0, matchStart - first.start))
  range.setEnd(last.node, Math.min(last.node.nodeValue.length, matchEnd - last.start))

  const mark = document.createElement('mark')
  mark.className = MARK_CLASS
  mark.setAttribute('data-id', h.id)

  try {
    range.surroundContents(mark)
    return true
  } catch (e) {
    try {
      const fragment = range.extractContents()
      mark.appendChild(fragment)
      range.insertNode(mark)
      return true
    } catch (e2) {
      return false
    }
  }
}

function getBlockAncestor(node, root) {
  let n = node
  while (n && n !== root) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const display = window.getComputedStyle(n).display
      if (display === 'block' || display === 'list-item' || display === 'flex' || display === 'grid' || display === 'table-row') {
        return n
      }
      const tag = n.nodeName
      if (['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TR', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'ASIDE'].includes(tag)) {
        return n
      }
    }
    n = n.parentNode
  }
  return root
}

function getSurroundingText(node, offset, root, maxLen) {
  if (!node || maxLen === 0) return ''
  const text = node.nodeType === Node.TEXT_NODE ? node.nodeValue : ''
  let result = ''
  if (maxLen < 0) {
    result = text.substring(0, offset)
    let n = node
    while (result.length < -maxLen) {
      n = getPreviousTextNode(n, root)
      if (!n) break
      result = n.nodeValue + result
    }
    return result.slice(Math.max(0, result.length + maxLen))
  } else {
    result = text.substring(offset)
    let n = node
    while (result.length < maxLen) {
      n = getNextTextNode(n, root)
      if (!n) break
      result = result + n.nodeValue
    }
    return result.slice(0, maxLen)
  }
}

function getPreviousTextNode(node, root) {
  let n = node
  while (n && n !== root) {
    if (n.previousSibling) {
      n = n.previousSibling
      while (n.lastChild) n = n.lastChild
      if (n.nodeType === Node.TEXT_NODE && n.nodeValue.length > 0) return n
    } else {
      n = n.parentNode
    }
  }
  return null
}

function getNextTextNode(node, root) {
  let n = node
  while (n && n !== root) {
    if (n.nextSibling) {
      n = n.nextSibling
      while (n.firstChild) n = n.firstChild
      if (n.nodeType === Node.TEXT_NODE && n.nodeValue.length > 0) return n
    } else {
      n = n.parentNode
    }
  }
  return null
}

export default function HighlightableViewer({ filePath, scopeRef, children }) {
  const wrapperRef = useRef(null)
  const toolbarRef = useRef(null)
  const { highlights, setHighlights, persistHighlights, showToast } = useApp()
  const [toolbar, setToolbar] = useState(null)

  const fileHighlights = filePath ? (highlights[filePath] || []) : []

  useLayoutEffect(() => {
    if (!wrapperRef.current) return
    const root = scopeRef && scopeRef.current ? scopeRef.current : wrapperRef.current
    try {
      stripExistingHighlights(root)
      for (const h of fileHighlights) {
        applyHighlightToRange(root, h)
      }
    } catch (e) {
    }
  }, [children, fileHighlights, scopeRef])

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      if (!wrapperRef.current) return
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return
      const range = selection.getRangeAt(0)
      const text = selection.toString().trim()

      if (!text) return
      if (!wrapperRef.current.contains(range.commonAncestorContainer)) return

      let n = range.commonAncestorContainer
      while (n && n !== wrapperRef.current) {
        if (n.nodeType === Node.ELEMENT_NODE && n.nodeName === 'MARK' && n.classList && n.classList.contains(MARK_CLASS)) {
          return
        }
        n = n.parentNode
      }

      const startBlock = getBlockAncestor(range.startContainer, wrapperRef.current)
      const endBlock = getBlockAncestor(range.endContainer, wrapperRef.current)
      if (startBlock !== endBlock) {
        showToast('Select text within a single block')
        return
      }

      const prefix = getSurroundingText(range.startContainer, range.startOffset, wrapperRef.current, -PREFIX_LEN)
      const suffix = getSurroundingText(range.endContainer, range.endOffset, wrapperRef.current, SUFFIX_LEN)

      const rect = range.getBoundingClientRect()
      setToolbar({
        mode: 'add',
        x: rect.left + rect.width / 2,
        y: rect.top,
        text,
        prefix,
        suffix
      })
    }, 10)
  }, [showToast])

  const handleClick = useCallback((e) => {
    const target = e.target
    if (!target || !target.closest) return
    const mark = target.closest(MARK_SELECTOR)
    if (mark) {
      const id = mark.getAttribute('data-id')
      const rect = mark.getBoundingClientRect()
      setToolbar({
        mode: 'remove',
        x: rect.left + rect.width / 2,
        y: rect.top,
        id
      })
    }
  }, [])

  useEffect(() => {
    if (!toolbar) return
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setToolbar(null)
        window.getSelection()?.removeAllRanges()
      }
    }
    const handleMouseDown = (e) => {
      const t = e.target
      if (toolbarRef.current && toolbarRef.current.contains(t)) return
      if (t && t.closest && t.closest(MARK_SELECTOR)) return
      setToolbar(null)
    }
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleMouseDown)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleMouseDown)
    }
  }, [toolbar])

  const handleAdd = useCallback(() => {
    if (!toolbar || toolbar.mode !== 'add' || !filePath) return
    const newHighlight = {
      id: generateId(),
      prefix: toolbar.prefix,
      text: toolbar.text,
      suffix: toolbar.suffix,
      createdAt: Date.now()
    }
    const current = highlights[filePath] || []
    const next = [...current, newHighlight]
    setHighlights(prev => ({ ...prev, [filePath]: next }))
    persistHighlights(filePath, next)
    setToolbar(null)
    window.getSelection()?.removeAllRanges()
  }, [toolbar, filePath, highlights, setHighlights, persistHighlights])

  const handleRemove = useCallback(() => {
    if (!toolbar || toolbar.mode !== 'remove' || !filePath) return
    const current = highlights[filePath] || []
    const next = current.filter(h => h.id !== toolbar.id)
    setHighlights(prev => ({ ...prev, [filePath]: next }))
    persistHighlights(filePath, next)
    setToolbar(null)
  }, [toolbar, filePath, highlights, setHighlights, persistHighlights])

  return (
    <div
      ref={wrapperRef}
      className="mdt-highlight-wrapper"
      onMouseUp={handleMouseUp}
      onClick={handleClick}
    >
      {children}
      {toolbar && (
        <div ref={toolbarRef} className="mdt-highlight-toolbar-wrapper">
          <HighlightToolbar
            mode={toolbar.mode}
            x={toolbar.x}
            y={toolbar.y}
            onAdd={handleAdd}
            onRemove={handleRemove}
          />
        </div>
      )}
    </div>
  )
}
