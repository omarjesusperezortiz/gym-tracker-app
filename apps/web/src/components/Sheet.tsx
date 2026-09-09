import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

// Bottom drawer used by Calendar's day-detail view (and any future sheet).
// Radix Dialog gives us a real focus trap, Esc-to-close, scroll lock, and
// aria wiring for free; the visual bottom-sheet look/slide-up animation is
// unchanged — it's still just the .modal/.sheet CSS underneath.
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
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal" />
        <Dialog.Content className="sheet" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          <div className="grab" />
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
