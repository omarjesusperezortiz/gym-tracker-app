// Height picker for onboarding — a horizontal ruler you drag/scroll to your
// height in cm, with the value shown large above and an accessible number-input
// fallback. Thin wrapper over the shared TickPicker.
import { TickPicker } from './TickPicker';

export function RulerPicker({
  value,
  onChange,
  ariaLabel = 'Height in cm',
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <TickPicker
      value={value}
      onChange={onChange}
      min={120}
      max={220}
      step={1}
      defaultValue={178}
      unit="cm"
      ariaLabel={ariaLabel}
      majorEvery={5}
      decimals={0}
    />
  );
}
