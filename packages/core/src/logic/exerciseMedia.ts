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
  "Overhead triceps": {
    id: "dZl9Q27",
    target: "triceps",
    secondary: ["shoulders"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a barbell with an overhand grip.",
      "Raise the barbell overhead, fully extending your arms.",
      "Keeping your upper arms close to your head, slowly lower the barbell behind your head by bending your elbows.",
      "Pause for a moment, then raise the barbell back to the starting position by extending your arms.",
    ],
  },
  "Side Plank": {
    id: "VO2qeJg",
    target: "adductors",
    secondary: ["obliques", "glutes"],
    equip: "body weight",
    steps: [
      "Start by lying on your side with your legs extended and stacked on top of each other.",
      "Prop yourself up on your forearm, keeping your elbow directly below your shoulder.",
      "Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.",
      "While maintaining the side plank position, lift your top leg towards the ceiling, keeping it straight.",
    ],
  },
  "Hanging/Lying Leg Raise": {
    id: "I3tsCnC",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your legs up in front of you, keeping them straight.",
      "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
    ],
  },
  "Leg raise (core)": {
    id: "I3tsCnC",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your legs up in front of you, keeping them straight.",
      "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
    ],
  },
  "Reverse Crunch": {
    id: "nCU1Ekp",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Lie flat on your back with your arms extended along your sides.",
      "Bend your knees and lift your feet off the ground, bringing your thighs perpendicular to the floor.",
      "Contract your abs and curl your hips off the floor, bringing your knees towards your chest.",
      "Pause for a moment at the top, then slowly lower your hips back down to the starting position.",
    ],
  },
  "Bicycle Crunch": {
    id: "tZkGYZ9",
    target: "abs",
    secondary: ["hip flexors", "obliques"],
    equip: "band",
    steps: [
      "Lie flat on your back with your hands behind your head and your knees bent.",
      "Lift your feet off the ground and bring your right knee towards your chest while simultaneously twisting your torso to bring your left elbow towards your right knee.",
      "Straighten your right leg while bringing your left knee towards your chest and twisting your torso to bring your right elbow towards your left knee.",
      "Continue alternating the twisting motion, as if you are pedaling a bicycle, while keeping your core engaged throughout the movement.",
    ],
  },
  "Russian Twist": {
    id: "fZFZ704",
    target: "abs",
    secondary: ["obliques", "lower back"],
    equip: "weighted",
    steps: [
      "Sit on the ground with your knees bent and your feet flat on the floor.",
      "Hold a weight or medicine ball with both hands in front of your chest.",
      "Lean back slightly, keeping your back straight and your core engaged.",
      "Slowly twist your torso to the right, bringing the weight or medicine ball towards the floor on your right side.",
    ],
  },
  "Pallof Press (anti-rotation)": {
    id: "9pa4H5m",
    target: "abs",
    secondary: ["obliques", "glutes"],
    equip: "band",
    steps: [
      "Attach the band to a sturdy anchor point at waist height.",
      "Stand perpendicular to the anchor point with your feet shoulder-width apart.",
      "Grasp the band handle with both hands and step away from the anchor point to create tension in the band.",
      "Bring your hands to your chest, keeping your elbows bent and close to your body.",
    ],
  },
};


/**
 * Media keyed by the SPECIFIC exercise name (a movement's equipment variation,
 * e.g. "Cable Crossover"). Lets the card show the demo for the exact exercise
 * the user has selected via the equipment tabs, not just the movement.
 */
export const variationMedia: Record<string, ExerciseMedia> = {
  "Air Bike": {
    id: "1ZFqTDN",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Lie flat on your back with your hands placed behind your head.",
      "Lift your legs off the ground and bend your knees at a 90-degree angle.",
      "Bring your right elbow towards your left knee while simultaneously straightening your right leg.",
      "Return to the starting position and repeat the movement on the opposite side, bringing your left elbow towards your right knee while straightening your left leg.",
    ],
  },
  "Band Pull Apart": {
    id: "VtTbiP3",
    target: "glutes",
    secondary: ["hamstrings", "lower back"],
    equip: "band",
    steps: [
      "Attach a resistance band to a sturdy anchor point at ground level.",
      "Stand facing away from the anchor point with your feet shoulder-width apart.",
      "Step forward to create tension in the band, keeping your knees slightly bent.",
      "Hinge at the hips and push your glutes back, maintaining a slight bend in your knees.",
    ],
  },
  "Barbell Bench Press - Medium Grip": {
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
  "Barbell Curl": {
    id: "25GPyDY",
    target: "biceps",
    secondary: ["forearms"],
    equip: "barbell",
    steps: [
      "Stand up straight with your feet shoulder-width apart and hold a barbell with an underhand grip, palms facing forward.",
      "Keep your elbows close to your torso and exhale as you curl the weights while contracting your biceps.",
      "Continue to raise the bar until your biceps are fully contracted and the bar is at shoulder level.",
      "Hold the contracted position for a brief pause as you squeeze your biceps.",
    ],
  },
  "Barbell Full Squat": {
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
  "Barbell Incline Bench Press - Medium Grip": {
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
  "Barbell Lunge": {
    id: "t8iSghb",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "barbell",
    steps: [
      "Start by standing with your feet shoulder-width apart and a barbell resting on your upper back.",
      "Take a step forward with your right foot, keeping your torso upright.",
      "Lower your body by bending your right knee until your thigh is parallel to the ground.",
      "Push through your right heel to return to the starting position.",
    ],
  },
  "Barbell Shrug": {
    id: "dG7tG5y",
    target: "traps",
    secondary: ["shoulders"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a barbell in front of you with an overhand grip.",
      "Keep your arms straight and your back straight throughout the exercise.",
      "Lift your shoulders up towards your ears as high as possible, squeezing your traps at the top.",
      "Hold for a moment, then slowly lower your shoulders back down to the starting position.",
    ],
  },
  "Bench Dips": {
    id: "05Cf2v8",
    target: "triceps",
    secondary: ["chest", "shoulders"],
    equip: "body weight",
    steps: [
      "Position yourself between two parallel bars with your arms fully extended and your body suspended in the air.",
      "Bend your knees and cross your ankles.",
      "Lower your body by bending your elbows until your upper arms are parallel to the ground.",
      "Pause for a moment, then push yourself back up to the starting position by straightening your arms.",
    ],
  },
  "Bent Over Barbell Row": {
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
  "Bent Over Two-Dumbbell Row": {
    id: "BJ0Hz5L",
    target: "upper back",
    secondary: ["biceps", "forearms"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, knees slightly bent, and hold a dumbbell in each hand with your palms facing your body.",
      "Bend forward at the hips, keeping your back straight and your core engaged.",
      "Let your arms hang straight down towards the floor, with your elbows slightly bent.",
      "Pull the dumbbells up towards your chest, squeezing your shoulder blades together.",
    ],
  },
  "Bent-Arm Dumbbell Pullover": {
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
  "Bodyweight Squat": {
    id: "wfotm7S",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "body weight",
    steps: [
      "Stand with your feet shoulder-width apart.",
      "Lower your body into a squat position by bending your knees and pushing your hips back.",
      "Jump up explosively, extending your hips, knees, and ankles.",
      "While in mid-air, quickly bring your feet together.",
    ],
  },
  "Bodyweight Walking Lunge": {
    id: "IZVHb27",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "body weight",
    steps: [
      "Stand with your feet shoulder-width apart.",
      "Take a step forward with your right leg, lowering your body into a lunge position.",
      "Keep your torso upright and your front knee aligned with your ankle.",
      "Push off with your right foot and bring your left foot forward, stepping into a lunge position with your left leg.",
    ],
  },
  "Butt Lift (Bridge)": {
    id: "GibBPPg",
    target: "glutes",
    secondary: ["hamstrings", "quadriceps"],
    equip: "body weight",
    steps: [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Engage your glutes and lift your hips off the ground, forming a straight line from your knees to your shoulders.",
      "While keeping your hips lifted, lift one foot off the ground and bring your knee towards your chest.",
      "Lower your foot back to the ground and repeat the movement with the other leg.",
    ],
  },
  "Butterfly": {
    id: "bWlZvXh",
    target: "adductors",
    secondary: ["hamstrings", "groin"],
    equip: "body weight",
    steps: [
      "Sit on the floor with your legs extended in front of you.",
      "Bend your knees and bring the soles of your feet together, allowing your knees to fall out to the sides.",
      "Hold onto your ankles or feet with your hands.",
      "Sit up tall and lengthen your spine.",
    ],
  },
  "Cable Chest Press": {
    id: "nIR4Rwl",
    target: "pectorals",
    secondary: ["shoulders", "triceps"],
    equip: "cable",
    steps: [
      "Adjust the seat height and cable handles to a comfortable position.",
      "Sit on the bench with your back straight and feet flat on the floor.",
      "Grasp the cable handles with an overhand grip at shoulder height.",
      "Push the handles forward and away from your body, extending your arms fully.",
    ],
  },
  "Cable Crossover": {
    id: "UFGF6gk",
    target: "upper back",
    secondary: ["biceps", "forearms"],
    equip: "cable",
    steps: [
      "Sit on the rowing machine with your feet flat on the footrests and your knees slightly bent.",
      "Grasp the cable ropes with an overhand grip, palms facing each other.",
      "Lean back slightly, keeping your back straight and your core engaged.",
      "Pull the cable ropes towards your chest, squeezing your shoulder blades together.",
    ],
  },
  "Cable Crunch": {
    id: "8xUv4J7",
    target: "abs",
    secondary: ["obliques"],
    equip: "cable",
    steps: [
      "Sit on a cable machine with your feet flat on the ground and your knees bent.",
      "Hold the cable handle with both hands and position it behind your head.",
      "Engage your abs and slowly curl your upper body forward, bringing your chest towards your knees.",
      "Pause for a moment at the top, then slowly return to the starting position.",
    ],
  },
  "Cable Hammer Curls - Rope Attachment": {
    id: "HPlPoQA",
    target: "biceps",
    secondary: ["forearms"],
    equip: "cable",
    steps: [
      "Stand upright with your feet shoulder-width apart and a slight bend in your knees.",
      "Hold the cable rope attachment with an underhand grip, palms facing each other, and your arms fully extended.",
      "Keeping your upper arms stationary, exhale and curl the weights while contracting your biceps.",
      "Continue to raise the cable rope attachment until your biceps are fully contracted and the rope is at shoulder level.",
    ],
  },
  "Cable Rope Overhead Triceps Extension": {
    id: "2IxROQ1",
    target: "triceps",
    secondary: ["shoulders"],
    equip: "cable",
    steps: [
      "Attach a rope to a cable machine at a high position.",
      "Stand facing away from the machine with your feet shoulder-width apart.",
      "Grasp the rope with both hands, palms facing each other, and bring your hands above your head.",
      "Keep your upper arms close to your head and your elbows pointing forward.",
    ],
  },
  "Cable Seated Lateral Raise": {
    id: "goJ6ezq",
    target: "delts",
    secondary: ["traps", "triceps"],
    equip: "cable",
    steps: [
      "Stand with your feet shoulder-width apart and grasp the cable handles with an overhand grip.",
      "Keep your arms straight and your core engaged.",
      "Raise your arms out to the sides until they are parallel to the floor.",
      "Pause for a moment at the top, then slowly lower your arms back down to the starting position.",
    ],
  },
  "Cable Shoulder Press": {
    id: "PzQanLE",
    target: "delts",
    secondary: ["triceps", "upper back"],
    equip: "cable",
    steps: [
      "Adjust the cable machine so that the handles are at shoulder height.",
      "Stand facing away from the machine with your feet shoulder-width apart.",
      "Grasp the handles with an overhand grip and bring them up to shoulder level, with your elbows bent and pointing outwards.",
      "Press the handles upwards until your arms are fully extended overhead.",
    ],
  },
  "Cable Shrugs": {
    id: "Eg98Ft9",
    target: "traps",
    secondary: ["shoulders"],
    equip: "cable",
    steps: [
      "Stand facing the cable machine with your feet shoulder-width apart.",
      "Grasp the cable handles with an overhand grip and let your arms hang down in front of you.",
      "Keeping your arms straight, shrug your shoulders up towards your ears.",
      "Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.",
    ],
  },
  "Chin-Up": {
    id: "T2mxWqc",
    target: "lats",
    secondary: ["biceps", "forearms"],
    equip: "body weight",
    steps: [
      "Hang from a pull-up bar with your palms facing towards you and your hands shoulder-width apart.",
      "Engage your core and pull your body up towards the bar, leading with your chest.",
      "Continue pulling until your chin is above the bar.",
      "Pause for a moment at the top, then slowly lower your body back down to the starting position.",
    ],
  },
  "Decline Push-Up": {
    id: "i5cEhka",
    target: "pectorals",
    secondary: ["triceps", "shoulders"],
    equip: "body weight",
    steps: [
      "Place your hands on the ground slightly wider than shoulder-width apart, with your feet elevated on a stable surface.",
      "Keep your body in a straight line from head to toe, engaging your core muscles.",
      "Lower your chest towards the ground by bending your elbows, keeping them close to your body.",
      "Push through your palms to extend your arms and return to the starting position.",
    ],
  },
  "Dip Machine": {
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
  "Dips - Chest Version": {
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
  "Donkey Calf Raises": {
    id: "u5ESqzH",
    target: "calves",
    secondary: ["hamstrings", "glutes"],
    equip: "body weight",
    steps: [
      "Stand with your toes on an elevated surface, such as a step or block.",
      "Place your hands on a stable support, such as a wall or railing, for balance.",
      "Raise your heels as high as possible, lifting your body weight onto the balls of your feet.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
    ],
  },
  "Dumbbell Bench Press": {
    id: "SpYC0Kp",
    target: "pectorals",
    secondary: ["triceps", "shoulders"],
    equip: "dumbbell",
    steps: [
      "Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.",
      "Hold a dumbbell in each hand, with your palms facing forward and your arms extended above your chest.",
      "Lower the dumbbells slowly to the sides of your chest, keeping your elbows at a 90-degree angle.",
      "Pause for a moment, then push the dumbbells back up to the starting position, fully extending your arms.",
    ],
  },
  "Dumbbell Bicep Curl": {
    id: "xiA6lRr",
    target: "biceps",
    secondary: ["forearms"],
    equip: "dumbbell",
    steps: [
      "Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.",
      "Keep your back straight and your elbows close to your torso.",
      "Exhale and curl the dumbbells up towards your shoulders, contracting your biceps.",
      "Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.",
    ],
  },
  "Dumbbell Flyes": {
    id: "1PLE8e9",
    target: "pectorals",
    secondary: ["shoulders", "triceps"],
    equip: "dumbbell",
    steps: [
      "Set an incline bench to a 45-degree angle and sit on it with a dumbbell in each hand, palms facing each other.",
      "Lie back on the bench and press the dumbbells up to the starting position, directly above your chest, with your arms extended.",
      "Lower the dumbbells out to the sides in a wide arc until you feel a stretch in your chest.",
      "As you lower the dumbbells, rotate your wrists so that your palms face forward at the bottom of the movement.",
    ],
  },
  "Dumbbell Lunges": {
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
  "Dumbbell Shrug": {
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
  "Dumbbell Squat": {
    id: "HsvHqgf",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand at your sides.",
      "Keeping your chest up and core engaged, lower your body down by bending at the knees and hips, as if sitting back into a chair.",
      "Continue lowering until your thighs are parallel to the ground, or as low as you can comfortably go.",
      "Pause for a moment at the bottom, then push through your heels to return to the starting position.",
    ],
  },
  "Face Pull": {
    id: "zCgxPbV",
    target: "lats",
    secondary: ["shoulders", "biceps"],
    equip: "cable",
    steps: [
      "Attach a cable handle to a low pulley and stand facing the machine.",
      "Grasp the handle with your left hand and step away from the machine, extending your arm fully.",
      "Position your feet shoulder-width apart, with your knees slightly bent.",
      "Keep your back straight and your core engaged throughout the exercise.",
    ],
  },
  "Flat Bench Lying Leg Raise": {
    id: "WhuFnR7",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Lie flat on a flat bench with your back pressed against it.",
      "Place your hands under your glutes for support.",
      "Keep your legs straight and together, and lift them up towards the ceiling.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
    ],
  },
  "Front Cable Raise": {
    id: "u2X71Np",
    target: "delts",
    secondary: ["triceps", "forearms"],
    equip: "cable",
    steps: [
      "Stand with your feet shoulder-width apart and grasp the cable handle with an overhand grip.",
      "Keep your back straight and your core engaged.",
      "Raise the cable handle in front of you, keeping your arms straight and your palms facing down.",
      "Continue lifting until your arms are parallel to the floor.",
    ],
  },
  "Front Dumbbell Raise": {
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
  "Front Plate Raise": {
    id: "b2Uoz54",
    target: "delts",
    secondary: ["biceps", "triceps"],
    equip: "barbell",
    steps: [
      "Stand with your feet shoulder-width apart and hold a barbell in front of your thighs with an overhand grip.",
      "Keep your arms straight and lift the barbell forward and upward until it reaches shoulder level.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Hammer Curls": {
    id: "GNhAeJ0",
    target: "biceps",
    secondary: ["forearms"],
    equip: "dumbbell",
    steps: [
      "Stand up straight with a dumbbell in each hand, palms facing your torso.",
      "Keep your elbows close to your torso and rotate the palms of your hands until they are facing forward.",
      "This will be your starting position.",
      "Now, while holding your upper arm stationary, exhale and curl the weights while contracting your biceps.",
    ],
  },
  "Hanging Leg Raise": {
    id: "I3tsCnC",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Hang from a pull-up bar with your arms fully extended and your palms facing away from you.",
      "Engage your core and lift your legs up in front of you, keeping them straight.",
      "Continue lifting until your legs are parallel to the ground or as high as you can comfortably go.",
      "Pause for a moment at the top, then slowly lower your legs back down to the starting position.",
    ],
  },
  "Incline Dumbbell Press": {
    id: "ns0SIbU",
    target: "pectorals",
    secondary: ["shoulders", "triceps"],
    equip: "dumbbell",
    steps: [
      "Set up an incline bench at a 45-degree angle.",
      "Sit on the bench with your feet flat on the ground and your back pressed firmly against the bench.",
      "Hold a dumbbell in each hand, palms facing forward, and lift them to shoulder height.",
      "Slowly lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.",
    ],
  },
  "Inverted Row": {
    id: "bZGHsAZ",
    target: "upper back",
    secondary: ["biceps", "forearms"],
    equip: "body weight",
    steps: [
      "Set up a bar at waist height or use a suspension trainer.",
      "Stand facing the bar or suspension trainer, with your feet shoulder-width apart.",
      "Grab the bar or handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Lean back, keeping your body straight and your heels on the ground.",
    ],
  },
  "Lateral Raise - With Bands": {
    id: "sTg7iys",
    target: "delts",
    secondary: ["traps", "upper back"],
    equip: "band",
    steps: [
      "Stand with your feet shoulder-width apart and hold the band in front of your thighs with your palms facing down.",
      "Keep your arms straight and lift the band up in front of you until your arms are parallel to the ground.",
      "Pause for a moment at the top, then slowly lower the band back down to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Leg Press": {
    id: "7zdxRTl",
    target: "glutes",
    secondary: ["quadriceps", "hamstrings", "calves"],
    equip: "smith machine",
    steps: [
      "Adjust the seat and footplate of the smith machine to a comfortable position.",
      "Sit on the machine with your back against the backrest and your feet shoulder-width apart on the footplate.",
      "Grasp the handles or sides of the machine for stability.",
      "Push the footplate away from you by extending your legs, keeping your back against the backrest.",
    ],
  },
  "Leverage High Row": {
    id: "nZZZy9m",
    target: "upper back",
    secondary: ["biceps", "rear deltoids"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and foot platform to a comfortable position.",
      "Sit on the machine with your chest against the pad and your feet flat on the foot platform.",
      "Grasp the handles with an overhand grip, slightly wider than shoulder-width apart.",
      "Keep your back straight and engage your core.",
    ],
  },
  "Leverage Incline Chest Press": {
    id: "jHAnWmT",
    target: "pectorals",
    secondary: ["shoulders", "triceps"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat and backrest of the leverage machine to a comfortable position.",
      "Sit on the machine with your back against the backrest and your feet flat on the floor.",
      "Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.",
      "Push the handles forward and away from your body until your arms are fully extended.",
    ],
  },
  "Leverage Shrug": {
    id: "ZZKbeMw",
    target: "traps",
    secondary: ["shoulders"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the leverage machine with your back against the pad.",
      "Grasp the handles with an overhand grip and keep your arms straight.",
      "Keeping your back straight, lift your shoulders up towards your ears as high as possible.",
      "Hold the contraction for a moment, then slowly lower your shoulders back down to the starting position.",
    ],
  },
  "Low Cable Crossover": {
    id: "FVmZVhk",
    target: "pectorals",
    secondary: ["deltoids", "triceps"],
    equip: "cable",
    steps: [
      "Attach the handles to the low pulleys of a cable machine and select an appropriate weight.",
      "Stand in the middle of the machine with your feet shoulder-width apart and a slight bend in your knees.",
      "Grasp the handles with an overhand grip and extend your arms out to the sides, keeping a slight bend in your elbows.",
      "Maintaining control, slowly bring your arms forward in a sweeping motion, crossing them in front of your body.",
    ],
  },
  "Lying Leg Curls": {
    id: "17lJ1kr",
    target: "hamstrings",
    secondary: ["calves"],
    equip: "leverage machine",
    steps: [
      "Adjust the machine to fit your body and select the desired weight.",
      "Lie face down on the machine with your legs straight and your heels against the padded lever.",
      "Grasp the handles or the sides of the machine for stability.",
      "Keeping your upper body stationary, exhale and curl your legs up as far as possible without lifting your hips off the pad.",
    ],
  },
  "Lying Triceps Press": {
    id: "iZop9xO",
    target: "triceps",
    secondary: ["shoulders"],
    equip: "barbell",
    steps: [
      "Lie flat on a bench with your feet flat on the ground and your head at the end of the bench.",
      "Hold the barbell with an overhand grip, hands shoulder-width apart, and extend your arms straight up over your chest.",
      "Keeping your upper arms stationary, slowly lower the barbell towards your forehead by bending your elbows.",
      "Pause for a moment at the bottom, then extend your arms back up to the starting position.",
    ],
  },
  "Machine Bench Press": {
    id: "wDN97Ca",
    target: "pectorals",
    secondary: ["triceps", "shoulders"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the machine with your back flat against the pad.",
      "Grasp the handles with an overhand grip and position your elbows at a 90-degree angle.",
      "Push the handles forward until your arms are fully extended, exhaling during the movement.",
      "Pause for a moment at the end of the movement, then slowly return to the starting position, inhaling as you do so.",
    ],
  },
  "Machine Bicep Curl": {
    id: "zILLZ98",
    target: "biceps",
    secondary: ["forearms"],
    equip: "smith machine",
    steps: [
      "Adjust the height of the smith machine bar to be at waist level.",
      "Stand facing the smith machine with your feet shoulder-width apart.",
      "Grasp the bar with an underhand grip, hands slightly wider than shoulder-width apart.",
      "Keep your elbows close to your sides and your upper arms stationary.",
    ],
  },
  "Machine Shoulder (Military) Press": {
    id: "67n3r98",
    target: "delts",
    secondary: ["triceps", "chest"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the machine with your back against the backrest.",
      "Grasp the handles with an overhand grip and position your hands at shoulder level.",
      "Push the handles upward until your arms are fully extended, but do not lock your elbows.",
      "Pause for a moment at the top, then slowly lower the handles back down to the starting position.",
    ],
  },
  "Machine Triceps Extension": {
    id: "Ser9eQp",
    target: "triceps",
    secondary: ["shoulders"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the machine with your back against the pad.",
      "Grasp the handles with an overhand grip and fully extend your arms in front of you.",
      "Keeping your upper arms stationary, slowly lower the handles towards your forehead by bending your elbows.",
      "Pause for a moment at the bottom, then push the handles back up to the starting position by extending your arms.",
    ],
  },
  "One-Arm Dumbbell Row": {
    id: "6cKQC5E",
    target: "delts",
    secondary: ["traps", "biceps"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in one hand with an overhand grip.",
      "Let the dumbbell hang at arm's length in front of your thighs, with your palm facing your body.",
      "Keeping your back straight and your core engaged, exhale and lift the dumbbell straight up towards your chin, leading with your elbow.",
      "Pause for a moment at the top, then inhale and slowly lower the dumbbell back down to the starting position.",
    ],
  },
  "Pallof Press": {
    id: "9pa4H5m",
    target: "abs",
    secondary: ["obliques", "glutes"],
    equip: "band",
    steps: [
      "Attach the band to a sturdy anchor point at waist height.",
      "Stand perpendicular to the anchor point with your feet shoulder-width apart.",
      "Grasp the band handle with both hands and step away from the anchor point to create tension in the band.",
      "Bring your hands to your chest, keeping your elbows bent and close to your body.",
    ],
  },
  "Palms-Down Dumbbell Wrist Curl Over A Bench": {
    id: "2dImyQ8",
    target: "forearms",
    secondary: ["biceps", "shoulders"],
    equip: "dumbbell",
    steps: [
      "Sit on a bench with your feet flat on the ground and hold a dumbbell in each hand, palms facing up.",
      "Rest your forearms on your thighs, allowing your wrists to hang off the edge.",
      "Slowly curl your wrists upward, squeezing your forearms at the top of the movement.",
      "Pause for a moment, then lower your wrists back down to the starting position.",
    ],
  },
  "Palms-Up Barbell Wrist Curl Over A Bench": {
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
  "Plank": {
    id: "CosupLu",
    target: "abs",
    secondary: ["obliques", "shoulders"],
    equip: "body weight",
    steps: [
      "Start in a high plank position with your hands directly under your shoulders and your body in a straight line from head to toe.",
      "Engage your core and glutes to maintain a stable position.",
      "Rotate your torso to the right, lifting your right arm and extending it towards the ceiling.",
      "Keep your hips and legs stable as you twist.",
    ],
  },
  "Pullups": {
    id: "0V2YQjW",
    target: "lats",
    secondary: ["biceps", "forearms"],
    equip: "body weight",
    steps: [
      "Hang from a pull-up bar with a neutral grip (palms facing each other) and your arms fully extended.",
      "Engage your core and squeeze your shoulder blades together.",
      "Pull your body up towards the bar by bending your elbows and driving your elbows down towards your hips.",
      "Continue pulling until your chin is above the bar.",
    ],
  },
  "Pushups": {
    id: "I4hDWkc",
    target: "pectorals",
    secondary: ["triceps", "deltoids", "core"],
    equip: "body weight",
    steps: [
      "Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.",
      "Engage your core and lower your body towards the ground by bending your elbows, keeping your body in a straight line.",
      "Pause for a moment when your chest is just above the ground, then push yourself back up to the starting position by straightening your arms.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Reverse Crunch": {
    id: "nCU1Ekp",
    target: "abs",
    secondary: ["hip flexors"],
    equip: "body weight",
    steps: [
      "Lie flat on your back with your arms extended along your sides.",
      "Bend your knees and lift your feet off the ground, bringing your thighs perpendicular to the floor.",
      "Contract your abs and curl your hips off the floor, bringing your knees towards your chest.",
      "Pause for a moment at the top, then slowly lower your hips back down to the starting position.",
    ],
  },
  "Reverse Machine Flyes": {
    id: "myfUsKf",
    target: "delts",
    secondary: ["trapezius", "rhomboids"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the machine with your chest against the pad and your feet flat on the floor.",
      "Grasp the handles with an overhand grip and keep your arms slightly bent.",
      "Exhale and squeeze your shoulder blades together as you pull the handles back and outward, away from your body.",
      "Pause for a moment at the peak contraction, then inhale and slowly return to the starting position.",
    ],
  },
  "Romanian Deadlift": {
    id: "rR0LJzx",
    target: "glutes",
    secondary: ["hamstrings", "lower back"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.",
      "Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing your knees to bend slightly.",
      "Lower the dumbbells until you feel a stretch in your hamstrings, then push through your heels and engage your glutes to return to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Russian Twist": {
    id: "XVDdcoj",
    target: "abs",
    secondary: ["obliques"],
    equip: "body weight",
    steps: [
      "Sit on the ground with your knees bent and feet flat on the floor.",
      "Lean back slightly while keeping your back straight and your core engaged.",
      "Hold your hands together in front of your chest or hold a weight if desired.",
      "Lift your feet off the ground, balancing on your sit bones.",
    ],
  },
  "Seated Bent-Over Rear Delt Raise": {
    id: "XUUD0Fs",
    target: "upper back",
    secondary: ["shoulders", "biceps"],
    equip: "dumbbell",
    steps: [
      "Lie face down on a flat bench with a dumbbell in each hand, palms facing inwards.",
      "Extend your arms straight down towards the floor, keeping a slight bend in your elbows.",
      "Engaging your back muscles, lift the dumbbells up towards your chest, squeezing your shoulder blades together.",
      "Pause for a moment at the top, then slowly lower the dumbbells back down to the starting position.",
    ],
  },
  "Seated Cable Rows": {
    id: "fUBheHs",
    target: "upper back",
    secondary: ["biceps", "forearms"],
    equip: "cable",
    steps: [
      "Sit on the cable row machine with your feet flat on the footrests and your knees slightly bent.",
      "Grasp the handles with an overhand grip, keeping your back straight and your shoulders relaxed.",
      "Pull the handles towards your body, squeezing your shoulder blades together.",
      "Pause for a moment at the peak of the movement, then slowly release the handles back to the starting position.",
    ],
  },
  "Side Bridge": {
    id: "RKjH6Lt",
    target: "abs",
    secondary: ["obliques", "glutes"],
    equip: "body weight",
    steps: [
      "Lie on your side with your legs extended and stacked on top of each other.",
      "Place your forearm on the ground directly below your shoulder, with your elbow bent at a 90-degree angle.",
      "Engage your core and lift your hips off the ground, creating a straight line from your head to your feet.",
      "Hold this position for the desired amount of time.",
    ],
  },
  "Side Lateral Raise": {
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
  "Smith Machine Upright Row": {
    id: "1DN3iz4",
    target: "delts",
    secondary: ["traps", "biceps"],
    equip: "smith machine",
    steps: [
      "Stand with your feet shoulder-width apart, facing the smith machine.",
      "Grasp the barbell with an overhand grip, hands slightly wider than shoulder-width apart.",
      "Keep your back straight and your core engaged.",
      "Pull the barbell up towards your chin, leading with your elbows.",
    ],
  },
  "Standing Barbell Calf Raise": {
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
  "Standing Calf Raises": {
    id: "2ORFMoR",
    target: "calves",
    secondary: ["hamstrings", "glutes"],
    equip: "sled machine",
    steps: [
      "Adjust the sled machine to a comfortable weight.",
      "Stand on the sled machine with your toes on the platform and your heels hanging off.",
      "Hold onto the handles for stability.",
      "Raise your heels as high as possible by pushing through the balls of your feet.",
    ],
  },
  "Standing Dumbbell Calf Raise": {
    id: "dPmaUaU",
    target: "calves",
    secondary: ["ankles"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand.",
      "Raise your heels off the ground as high as possible, using your calves.",
      "Pause for a moment at the top, then slowly lower your heels back down to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Standing Dumbbell Press": {
    id: "3d7wHyd",
    target: "delts",
    secondary: ["triceps", "chest"],
    equip: "dumbbell",
    steps: [
      "Sit on a bench with a dumbbell in each hand, resting on your thighs.",
      "Lean back and position the dumbbells to the sides of your chest, palms facing forward.",
      "Press the dumbbells upward until your arms are fully extended.",
      "Pause for a moment at the top, then slowly lower the dumbbells back to the starting position.",
    ],
  },
  "Standing Dumbbell Triceps Extension": {
    id: "kont8Ut",
    target: "triceps",
    secondary: ["shoulders"],
    equip: "dumbbell",
    steps: [
      "Sit on a bench with your back straight and feet flat on the ground.",
      "Hold a dumbbell with both hands and extend your arms straight up overhead.",
      "Bend your elbows and lower the dumbbell behind your head, keeping your upper arms close to your ears.",
      "Pause for a moment, then straighten your arms and return to the starting position.",
    ],
  },
  "Standing Dumbbell Upright Row": {
    id: "ainizkb",
    target: "delts",
    secondary: ["traps", "biceps"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.",
      "Let the dumbbells hang in front of your thighs, with your arms fully extended.",
      "Keeping your back straight and your core engaged, exhale and lift the dumbbells straight up towards your chin, leading with your elbows.",
      "Pause for a moment at the top, then inhale and slowly lower the dumbbells back down to the starting position.",
    ],
  },
  "Standing Military Press": {
    id: "CggQhII",
    target: "delts",
    secondary: ["triceps", "upper chest"],
    equip: "leverage machine",
    steps: [
      "Adjust the seat height and position yourself on the machine with your back against the backrest.",
      "Grasp the handles with an overhand grip and position your hands slightly wider than shoulder-width apart.",
      "Push the handles upward until your arms are fully extended, but do not lock your elbows.",
      "Pause for a moment at the top, then slowly lower the handles back down to the starting position.",
    ],
  },
  "Stiff-Legged Dumbbell Deadlift": {
    id: "5eLRITT",
    target: "glutes",
    secondary: ["hamstrings", "lower back"],
    equip: "dumbbell",
    steps: [
      "Stand with your feet shoulder-width apart, holding a dumbbell in each hand with an overhand grip.",
      "Keeping your back straight and your core engaged, hinge at the hips and lower the dumbbells towards the ground, allowing a slight bend in your knees.",
      "Lower the dumbbells until you feel a stretch in your hamstrings, then squeeze your glutes and push through your heels to return to the starting position.",
      "Repeat for the desired number of repetitions.",
    ],
  },
  "Straight-Arm Pulldown": {
    id: "x69MAlq",
    target: "lats",
    secondary: ["shoulders", "biceps"],
    equip: "cable",
    steps: [
      "Attach a straight bar to the high pulley of a cable machine.",
      "Stand facing the machine with your feet shoulder-width apart.",
      "Grasp the bar with an overhand grip, keeping your arms straight and your palms facing down.",
      "Engage your lats and pull the bar down towards your thighs, keeping your arms straight throughout the movement.",
    ],
  },
  "Superman": {
    id: "4GqRrAk",
    target: "pectorals",
    secondary: ["core", "shoulders"],
    equip: "body weight",
    steps: [
      "Start in a high plank position with your hands slightly wider than shoulder-width apart and your feet together.",
      "Engage your core and lower your body towards the ground, keeping your elbows close to your sides.",
      "As you lower your body, simultaneously lift your right arm and left leg off the ground, extending them straight out.",
      "Pause for a moment at the top, then lower your arm and leg back down while pushing yourself back up to the starting position.",
    ],
  },
  "Triceps Pushdown": {
    id: "gAwDzB3",
    target: "triceps",
    secondary: ["forearms"],
    equip: "cable",
    steps: [
      "Attach a v-bar attachment to the cable machine at the highest setting.",
      "Stand facing the cable machine with your feet shoulder-width apart.",
      "Grasp the v-bar with an overhand grip, palms facing down, and your hands shoulder-width apart.",
      "Keep your elbows close to your sides and your upper arms stationary throughout the exercise.",
    ],
  },
  "Upright Barbell Row": {
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
  "Upright Cable Row": {
    id: "cALKspW",
    target: "delts",
    secondary: ["traps", "biceps"],
    equip: "cable",
    steps: [
      "Stand with your feet shoulder-width apart, knees slightly bent, and hold the cable attachment with an overhand grip.",
      "Keep your back straight and your core engaged throughout the exercise.",
      "Pull the cable attachment straight up towards your chin, leading with your elbows.",
      "Pause for a moment at the top, squeezing your shoulder blades together.",
    ],
  },
  "Weighted Crunches": {
    id: "s8nrDXF",
    target: "abs",
    secondary: ["obliques"],
    equip: "weighted",
    steps: [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Hold a weight plate or dumbbell on your chest.",
      "Engage your abs and lift your upper body off the ground, curling forward until your shoulder blades are off the ground.",
      "Pause for a moment at the top, then slowly lower your upper body back down to the starting position.",
    ],
  },
  "Wide-Grip Lat Pulldown": {
    id: "qdRxqCj",
    target: "lats",
    secondary: ["biceps", "forearms"],
    equip: "cable",
    steps: [
      "Adjust the seat height so that your thighs are parallel to the ground and your feet are flat on the floor.",
      "Grasp the lat bar with an overhand grip, slightly wider than shoulder-width apart.",
      "Sit down and lean back slightly, keeping your chest up and your back straight.",
      "Pull the bar down towards your chest, squeezing your shoulder blades together.",
    ],
  },
};

/** Look up media for a catalog movement name (null when we have none yet). */
export function mediaFor(name: string): ExerciseMedia | null {
  return exerciseMedia[name] ?? null;
}

/**
 * Look up media for a SPECIFIC exercise (equipment variation) by its exact name,
 * falling back to the movement's media, then null. Use this on the card so the
 * demo tracks the selected equipment tab.
 */
export function mediaForExercise(exerciseName: string | undefined, movement: string): ExerciseMedia | null {
  if (exerciseName && variationMedia[exerciseName]) return variationMedia[exerciseName];
  return exerciseMedia[movement] ?? null;
}

/** Full gif URL for a media entry, given the app's media base path. */
export function gifUrl(media: ExerciseMedia, base: string): string {
  return `${base}${media.id}.webp`;
}

/** Static poster (first-frame JPG) URL — used where we want an image, not motion. */
export function posterUrl(media: ExerciseMedia, base: string): string {
  return `${base}posters/${media.id}.jpg`;
}
