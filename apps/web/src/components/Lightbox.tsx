export function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  return (
    <div className={`lightbox${src ? ' show' : ''}`} onClick={onClose}>
      {src && (
        <>
          <img src={src} alt="Exercise zoom" />
          <button className="lb-close" aria-label="Close">
            ✕
          </button>
        </>
      )}
    </div>
  );
}
