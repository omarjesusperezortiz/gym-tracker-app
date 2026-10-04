import { planFromCatalog } from './fromCatalog';

export const calisthenics = planFromCatalog('cal', {
  allowedEquipment: ['bodyweight'],
  // Gym's bodyweight dip is the parallel-bar chest version; here it's bench dips.
  slotDefaults: { 'Chest dip': { bw: 'RrLske5' } },
});
