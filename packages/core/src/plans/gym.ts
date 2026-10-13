import { planFromCatalog } from './fromCatalog';

export const gym = planFromCatalog('gym', {
  allowedEquipment: ['bodyweight', 'barbell', 'dumbbell', 'cable', 'machine', 'band', 'kettlebell', 'smith', 'weighted'],
});
