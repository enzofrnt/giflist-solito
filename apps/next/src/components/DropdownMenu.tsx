'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export interface DropdownItem {
  label: string
  href?: string
  onSelect?: () => void
  danger?: boolean
  disabled?: boolean
  mobileOnly?: boolean
  selected?: boolean
  description?: string
  icon?: ReactNode
}

type Position = { top: number; left?: number; right?: number }

export function DropdownMenu({
  label,
  trigger,
  items,
  align = 'end',
  triggerClassName = '',
}: {
  label: string
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'start' | 'end'
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(null)
  const menuId = useId()
  const triggerId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      setPosition(
        align === 'end'
          ? { top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right) }
          : { top: rect.bottom + 8, left: Math.max(8, rect.left) },
      )
    }

    updatePosition()

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (wrapperRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        triggerRef.current?.focus()
      } else if (event.key === 'Tab') {
        setOpen(false)
      }
    }
    const closeOnViewportChange = () => setOpen(false)

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', closeOnViewportChange, true)
    window.addEventListener('resize', closeOnViewportChange)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('scroll', closeOnViewportChange, true)
      window.removeEventListener('resize', closeOnViewportChange)
    }
  }, [align, open])

  useEffect(() => {
    if (!open || !position) return
    const timer = window.setTimeout(() => {
      itemRefs.current.find((item) => item && !item.hasAttribute('disabled'))?.focus()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [open, position])

  function handleMenuKeyDown(event: React.KeyboardEvent) {
    const enabled = itemRefs.current.filter((item) => item && !item.hasAttribute('disabled'))
    if (enabled.length === 0) return
    const currentIndex = enabled.indexOf(document.activeElement as HTMLElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      enabled[currentIndex < 0 ? 0 : (currentIndex + 1) % enabled.length]?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      enabled[currentIndex < 0 ? enabled.length - 1 : (currentIndex - 1 + enabled.length) % enabled.length]?.focus()
    } else if (event.key === 'Home') {
      event.preventDefault()
      enabled[0]?.focus()
    } else if (event.key === 'End') {
      event.preventDefault()
      enabled[enabled.length - 1]?.focus()
    }
  }

  function select(item: DropdownItem) {
    if (item.disabled) return
    setOpen(false)
    item.onSelect?.()
  }

  const menu = open && position && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={menuRef}
          id={menuId}
          className="ds-dropdown__menu"
          role="menu"
          aria-labelledby={triggerId}
          style={{ position: 'fixed', top: position.top, left: position.left, right: position.right }}
          onKeyDown={handleMenuKeyDown}
        >
          {items.map((item, index) => {
            const itemClass = `ds-dropdown__item${item.danger ? ' ds-dropdown__item--danger' : ''}${item.mobileOnly ? ' ds-dropdown__item--mobile-only' : ''}${item.selected ? ' ds-dropdown__item--selected' : ''}`
            const content = (
              <>
                {item.icon ? <span className="ds-dropdown__icon" aria-hidden="true">{item.icon}</span> : null}
                <span className="ds-dropdown__copy">
                  <span>{item.label}</span>
                  {item.description ? <span className="ds-dropdown__description">{item.description}</span> : null}
                </span>
                {item.selected ? <Check className="ds-dropdown__check" size={14} strokeWidth={2} aria-hidden="true" /> : null}
              </>
            )

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  className={itemClass}
                  aria-current={item.selected ? 'true' : undefined}
                  ref={(element) => { itemRefs.current[index] = element }}
                  onClick={() => setOpen(false)}
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={itemClass}
                aria-checked={item.selected ?? undefined}
                ref={(element) => { itemRefs.current[index] = element }}
                disabled={item.disabled}
                onClick={() => select(item)}
              >
                {content}
              </button>
            )
          })}
        </div>,
        document.body,
      )
    : null

  return (
    <div className="ds-dropdown" ref={wrapperRef}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={triggerClassName}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
      >
        {trigger}
      </button>
      {menu}
    </div>
  )
}
