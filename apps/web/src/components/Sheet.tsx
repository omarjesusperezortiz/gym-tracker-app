import * as Dialog from '@radix-ui/react-dialog';
import { useRef, useState, type ReactNode, type PointerEvent } from 'react';
import { IconClose } from '../lib/icons';

// Bottom drawer used by Calendar's day-detail view (and any future sheet).
// Radix Dialog gives us a real focus trap, Esc-to-close, scroll lock, and
// aria wiring for free. On top of that we add native-feeling swipe-down-to-close
// dragging on the grab handle / sheet, so it behaves like a real mobile sheet.
export function Sheet({
  open,
  onClose,
  title = 'Details',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (startY.current == null) return;
    const dy = e.clientY - startY.current;
    if (dy > 0) setDragY(dy); // only allow dragging downward
  }
  function onPointerUp() {
    if (startY.current == null) return;
    if (dragY > 110) {
      onClose();
    }
    startY.current = null;
    setDragY(0);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal" />
        <Dialog.Content
          ref={contentRef}
          className="sheet"
          aria-describedby={undefined}
          style={dragY ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <button className="sheet-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
          <div
            className="grab"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
