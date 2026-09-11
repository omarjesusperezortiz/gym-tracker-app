// Static exercise-image map: our catalog movement names -> a demonstration GIF
// (animated 3D render with the worked muscle highlighted) plus lightweight
// metadata. Sourced from exercisedb (free tier), AI-upscaled to 720px and
// MIRRORED into the app so we never depend on their CDN or rate limits at
// runtime. Images live at <base>exercise-media/<id>.gif (apps/web/public).
//
// Seeded with the upper-body catalog; expand as we mirror the rest of the 31
// movements. Anything not in the map renders no image (graceful fallback).

export interface ExerciseMedia {
  /** exercisedb id (also the gif filename, <id>.gif). */
  id: string;
  /** Primary worked muscle (exercisedb targetMuscle). */
  target: string;
  /** Secondary muscles. */
  secondary: string[];
  /** Equipment. */
  equip: string;
  /** Step-by-step how-to (optional, used on the detail view). */
  steps?: string[];
}

// Base path for the mirrored gifs is provided by the app (Vite base differs on
// web vs mobile), so core stays framework-agnostic. Callers pass the base to
// gifUrl(); the filename is always <id>.gif.

/** Catalog movement name -> media. Keys match catalog slot[0] exactly. */
export const exerciseMedia: Record<string, ExerciseMedia> = {
  "Flat chest press": {
    id: "EIeI8Vf",
    target: "pectorals",
    secondary: ["triceps", "shoulders"],
    equip: "barbell",
    steps: [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.",
      "Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.",
      "Lower the barbell slowly towards your chest, keeping your elbows tucked in.",
    ],
  },
  "Incline press": {
    id: "3TZduzM",
    target: "pectorals",
    secondary: ["shoulders", "triceps"],
    equip: "barbell",
    steps: [
      "Set up an incline bench at a 45-degree angle.",
      "Lie down on the bench with your feet flat on the ground.",
      "Grasp the barbell with an overhand grip, slightly wider than shoulder-width apart.",
      "Unrack the barbell and lower it slowly towards your chest, keeping your elbows at a 45-degree angle.",
    ],
  },
  "Chest fly": {
    id: "lJJ7Yq8",
    target: "pectorals",
    secondary: ["deltoids", "triceps"],
    equip: "cable",
    steps: [
      "Attach the handles to the cables and lie flat on a bench with your feet flat on the ground.",
      "Hold the handles with your palms facing each other and your arms extended straight above your chest.",
      "Keeping a slight bend in your elbows, lower your arms out to the sides in a wide arc until you feel a stretch in your chest.",
      "Pause for a moment, then squeeze your chest muscles to bring your arms back to the starting position.",
    ],
  },
  "Chest dip": {
    id: "9WTm7dq",
    target: "pectorals",
    secondary: ["triceps", "shoulders"],
    equip: "body weight",
    steps: [
      "Position yourself on parallel bars with your arms fully extended and your body straight.",
      "Lower your body by bending your elbows until your shoulders are below your elbows.",
      "Push yourself back up to the starting position by straightening your arms.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Horizontal row": {
    id: "eZyBC3j",
    target: "upper back",
    secondary: ["biceps", "forearms"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and knees slightly bent.",
      "Bend forward at the hips while keeping your back straight and chest up.",
      "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Pull the barbell towards your lower chest by retracting your shoulder blades and squeezing your back muscles.",
    ],
  },
  "Vertical pull (lats)": {
    id: "LEprlgG",
    target: "lats",
    secondary: ["biceps", "rhomboids", "rear deltoids"],
    equip: "cable",
    steps: [
      "Sit on the lat pulldown machine with your knees positioned under the pads.",
      "Grasp the cable bar with an overhand grip, slightly wider than shoulder-width apart.",
      "Lean back slightly and keep your chest up, maintaining a slight arch in your lower back.",
      "Pull the bar down towards your upper chest, squeezing your shoulder blades together.",
    ],
  },
  "Overhead press": {
    id: "Kyd9Rz5",
    target: "delts",
    secondary: ["triceps", "upper back"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold the barbell with an overhand grip, slightly wider than shoulder-width.",
      "Lift the barbell to shoulder height, keeping your elbows slightly in front of the bar.",
      "Press the barbell overhead, extending your arms fully.",
      "Lower the barbell back to shoulder height and repeat for the desired number of repetitions.",
    ],
  },
  "Side lateral raise": {
    id: "DsgkuIt",
    target: "delts",
    secondary: ["traps"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.",
      "Keep your back straight and engage your core.",
      "Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.",
      "Pause for a moment at the top, then slowly lower your arms back down to the starting position.",
    ],
  },
  "Front raise": {
    id: "3eGE2JC",
    target: "delts",
    secondary: ["biceps", "trapezius"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with your palms facing your thighs.",
      "Keeping your arms straight, exhale and lift the dumbbells in front of you until they are at shoulder level.",
      "Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Rear delts": {
    id: "EKXOMEh",
    target: "delts",
    secondary: ["trapezius", "rhomboids"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart and knees slightly bent.",
      "Hold a dumbbell in each hand with your palms facing your body.",
      "Bend forward at the waist, keeping your back straight and your core engaged.",
      "Extend your arms straight down towards the floor, with a slight bend in your elbows.",
    ],
  },
  "Upright row": {
    id: "UDlhcO8",
    target: "delts",
    secondary: ["traps", "biceps"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Let the barbell hang in front of your thighs, arms fully extended.",
      "Keeping your back straight and core engaged, exhale and lift the barbell straight up towards your chin, leading with your elbows.",
      "Pause for a moment at the top, then inhale and slowly lower the barbell back down to the starting position.",
    ],
  },
  "Shrugs (traps)": {
    id: "NJzBsGJ",
    target: "traps",
    secondary: ["shoulders"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a dumbbell in each hand with your palms facing your body.",
      "Keep your arms straight and let the dumbbells hang by your sides.",
      "Raise your shoulders as high as possible, as if you are trying to touch your ears with your shoulders.",
      "Hold the contraction for a second, then slowly lower your shoulders back down to the starting position.",
    ],
  },
  "Biceps curl": {
    id: "NbVPDMW",
    target: "biceps",
    secondary: ["forearms"],
    equip: "dumbbell",
    steps: [
      "Stand up straight with a dumbbell in each hand, palms facing forward and arms fully extended.",
      "Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.",
      "Continue to raise the weights until your biceps are fully contracted and the dumbbells are at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
    ],
  },
  "Hammer curl": {
    id: "slDvUAU",
    target: "biceps",
    secondary: ["forearms"],
    equip: "dumbbell",
    steps: [
      "Stand up straight with a dumbbell in each hand, palms facing your torso.",
      "Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.",
      "This will be your starting position.",
      "Now, keeping the upper arms stationary, exhale and curl the weights while contracting your biceps.",
    ],
  },
  "Triceps pushdown/ext": {
    id: "3ZflifB",
    target: "triceps",
    secondary: ["forearms"],
    equip: "cable",
    steps: [
      "Attach a straight bar to a high pulley cable machine.",
      "Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.",
      "Grasp the bar with an overhand grip, hands shoulder-width apart.",
      "Keep your elbows close to your sides and your upper arms stationary.",
    ],
  },
  "Forearm / wrist": {
    id: "82LxxkW",
    target: "forearms",
    secondary: ["biceps", "brachialis"],
    equip: "barbell",
    steps: [
      "Sit on a bench with your feet flat on the ground and your forearms resting on your thighs, holding a barbell with an underhand grip.",
      "Allow the barbell to roll down to your fingertips, keeping your wrists straight.",
      "Slowly curl the barbell up towards your forearms by flexing your wrists.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
    ],
  },
  "Lat pullover / straight-arm": {
    id: "9XjtHvS",
    target: "pectorals",
    secondary: ["latissimus dorsi", "triceps"],
    equip: "dumbbell",
    steps: [
      "Lie flat on a bench with your head at one end and your feet on the floor.",
      "Hold a dumbbell with both hands and extend your arms straight above your chest.",
      "Keeping a slight bend in your elbows, slowly lower the dumbbell behind your head until you feel a stretch in your chest and shoulders.",
      "Pause for a moment, then raise the dumbbell back to the starting position.",
    ],
  },
  "Squat": {
    id: "qXTaZnJ",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart, toes slightly turned out.",
      "Hold the barbell across your upper back, resting it on your traps or rear delts.",
      "Engage your core and keep your chest up as you begin to lower your body down.",
      "Bend at the knees and hips, pushing your hips back and down as if sitting into a chair.",
    ],
  },
  "Lunge": {
    id: "RRWFUcw",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand.",
      "Take a step forward with your right foot, lowering your body into a lunge position.",
      "Keep your back straight and your chest up as you lower your body.",
      "Push through your right heel to return to the starting position.",
    ],
  },
  "Hamstring / RDL": {
    id: "wQ2c4XD",
    target: "glutes",
    secondary: ["hamstrings", "lower back"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and your toes pointing forward.",
      "Hold the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Bend at the hips, keeping your back straight and your knees slightly bent.",
      "Lower the barbell towards the ground, keeping it close to your body.",
    ],
  },
  "Calf raise": {
    id: "8ozhUIZ",
    target: "calves",
    secondary: ["hamstrings", "glutes"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and place a barbell across your upper back.",
      "Raise your heels off the ground as high as possible, using only your toes.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Plank": {
    id: "VBAWRPG",
    target: "abs",
    secondary: ["shoulders", "lower back"],
    equip: "weighted",
    steps: [
      "Start by lying face down on the floor.",
      "Place your forearms on the ground, with your elbows directly under your shoulders.",
      "Extend your legs straight out behind you, with your toes on the ground.",
      "Engage your core and lift your body off the ground, balancing on your forearms and toes.",
    ],
  },
  "Plank (core)": {
    id: "VBAWRPG",
    target: "abs",
    secondary: ["shoulders", "lower back"],
    equip: "weighted",
    steps: [
      "Start by lying face down on the floor.",
      "Place your forearms on the ground, with your elbows directly under your shoulders.",
      "Extend your legs straight out behind you, with your toes on the ground.",
      "Engage your core and lift your body off the ground, balancing on your forearms and toes.",
    ],
  },
};

/** Look up media for a catalog movement name (null when we have none yet). */
export function mediaFor(name: string): ExerciseMedia | null {
  return exerciseMedia[name] ?? null;
}

/** Full gif URL for a media entry, given the app's media base path. */
export function gifUrl(media: ExerciseMedia, base: string): string {
  return `${base}${media.id}.gif`;
}

/** Static poster (first-frame JPG) URL — used where we want an image, not motion. */
export function posterUrl(media: ExerciseMedia, base: string): string {
  return `${base}posters/${media.id}.jpg`;
}
