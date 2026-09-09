import { IconFinish, IconSave } from '../lib/icons';

export function Dock({ onSave, onFinish, hidden }: { onSave: () => void; onFinish: () => void; hidden: boolean }) {
  return (
    <div className={`dock${hidden ? ' hide' : ''}`}>
      <button className="savebtn" onClick={onSave}>
        <IconSave /> Save
      </button>
      <button className="primary" onClick={onFinish}>
        <IconFinish /> Finish
      </button>
    </div>
  );
}
