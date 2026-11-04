import { useEffect, useId, useRef } from 'react'

export default function AccountManagementDialog({ title, busy, onClose, children, focusTitle = false }) {
  const ref = useRef(null)
  const id = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement
    dialog.showModal()
    dialog.querySelector('[data-dialog-initial-focus]')?.focus()
    return () => {
      dialog.close()
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return <dialog ref={ref} className="u72-dialog" aria-labelledby={id}
    aria-busy={busy || undefined} onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
    <h2 id={id} tabIndex={-1} data-dialog-initial-focus={focusTitle || undefined}>{title}</h2>
    {children}
  </dialog>
}
