// Weight picker for onboarding — a horizontal scale you drag/scroll to your
// weight in kg (0.5kg steps), value shown large above, with an accessible
// number-input fallback. Thin wrapper over the shared TickPicker.
import { TickPicker } from './TickPicker';

export function ScalePicker({
  value,
  onChange,
  ariaLabel = 'Current weight in kg',
  defaultValue = 80,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  defaultValue?: number;
}) {
  return (
    <TickPicker
      value={value}
      onChange={onChange}
      min={35}
      max={200}
      step={0.5}
      defaultValue={defaultValue}
      unit="kg"
      ariaLabel={ariaLabel}
      majorEvery={10}
      decimals={1}
    />
  );
}
