// Auto-generated from the web app data.js. Static exercise/plan/meal catalog.
import type { Catalog } from "./types";

export const catalog = {
 "plans": {
  "gym": {
   "label": "Gym",
   "icon": "🏋️",
   "sessions": {
    "fullupper": {
     "name": "Full Upper",
     "emoji": "💪",
     "group": "broad",
     "muscles": "chest·back·shoulders·arms",
     "slots": [
      [
       "Flat chest press",
       "4 × 8–10",
       ""
      ],
      [
       "Horizontal row",
       "4 × 8–10",
       ""
      ],
      [
       "Overhead press",
       "3 × 8–12",
       ""
      ],
      [
       "Vertical pull (lats)",
       "3 × 8–10",
       ""
      ],
      [
       "Biceps curl",
       "3 × 10–12",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "3 × 10–12",
       ""
      ]
     ]
    },
    "push": {
     "name": "Push",
     "emoji": "🙌",
     "group": "broad",
     "muscles": "chest·shoulders·triceps + core",
     "slots": [
      [
       "Flat chest press",
       "4 × 6–10",
       "5 × 3–5 heavy"
      ],
      [
       "Incline press",
       "3 × 8–12",
       ""
      ],
      [
       "Overhead press",
       "3 × 8–12",
       ""
      ],
      [
       "Side lateral raise",
       "3 × 12–15",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "3 × 10–12",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "pull": {
     "name": "Pull",
     "emoji": "🧲",
     "group": "broad",
     "muscles": "back·biceps·rear delts",
     "slots": [
      [
       "Vertical pull (lats)",
       "4 × 6–10",
       "weighted 5 × 3–5"
      ],
      [
       "Horizontal row",
       "4 × 8–10",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ],
      [
       "Shrugs (traps)",
       "3 × 12–15",
       ""
      ],
      [
       "Biceps curl",
       "3 × 10–12",
       ""
      ],
      [
       "Hammer curl",
       "3 × 10–12",
       ""
      ]
     ]
    },
    "fullbody": {
     "name": "Full Body",
     "emoji": "🔥",
     "group": "broad",
     "muscles": "a bit of everything (short/travel)",
     "slots": [
      [
       "Squat",
       "3 × 10–12",
       ""
      ],
      [
       "Flat chest press",
       "3 × 8–12",
       ""
      ],
      [
       "Horizontal row",
       "3 × 8–12",
       ""
      ],
      [
       "Overhead press",
       "3 × 10–12",
       ""
      ],
      [
       "Leg raise (core)",
       "3 × 12–15",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "chest": {
     "name": "Chest",
     "emoji": "🎯",
     "group": "focused",
     "muscles": "chest · triceps assist",
     "slots": [
      [
       "Flat chest press",
       "4 × 6–10",
       "5 × 3–5 heavy"
      ],
      [
       "Incline press",
       "3 × 8–12",
       ""
      ],
      [
       "Chest fly",
       "3 × 12–15",
       ""
      ],
      [
       "Chest dip",
       "3 × 8–12",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "back": {
     "name": "Back",
     "emoji": "🪃",
     "group": "focused",
     "muscles": "lats · traps · rear delts",
     "slots": [
      [
       "Vertical pull (lats)",
       "4 × 6–10",
       "weighted 5 × 3–5"
      ],
      [
       "Horizontal row",
       "4 × 8–12",
       ""
      ],
      [
       "Lat pullover / straight-arm",
       "3 × 12–15",
       ""
      ],
      [
       "Shrugs (traps)",
       "3 × 12–15",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ]
     ]
    },
    "shoulders": {
     "name": "Shoulders",
     "emoji": "🔺",
     "group": "focused",
     "muscles": "delts (front·side·rear)",
     "slots": [
      [
       "Overhead press",
       "4 × 6–10",
       "5 × 4–6 heavy"
      ],
      [
       "Side lateral raise",
       "4 × 12–20",
       ""
      ],
      [
       "Front raise",
       "3 × 10–15",
       ""
      ],
      [
       "Upright row",
       "3 × 10–12",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ]
     ]
    },
    "arms": {
     "name": "Arms",
     "emoji": "💥",
     "group": "focused",
     "muscles": "biceps · triceps · forearms",
     "slots": [
      [
       "Biceps curl",
       "4 × 8–12",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "4 × 8–12",
       ""
      ],
      [
       "Hammer curl",
       "3 × 10–12",
       ""
      ],
      [
       "Overhead triceps",
       "3 × 10–12",
       ""
      ],
      [
       "Forearm / wrist",
       "3 × 15–20",
       ""
      ]
     ]
    },
    "legs": {
     "name": "Legs & Core",
     "emoji": "🦵",
     "group": "focused",
     "muscles": "legs (maintenance) · core",
     "slots": [
      [
       "Squat",
       "3 × 8–12",
       ""
      ],
      [
       "Lunge",
       "3 × 12/leg",
       ""
      ],
      [
       "Hamstring / RDL",
       "3 × 10–12",
       ""
      ],
      [
       "Calf raise",
       "3 × 15–20",
       ""
      ],
      [
       "Leg raise (core)",
       "3 × 12–15",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45–60s",
       ""
      ]
     ]
    },
    "core": {
     "name": "Core",
     "emoji": "🎯",
     "group": "focused",
     "muscles": "abs · obliques · lower back",
     "slots": [
      [
       "Plank",
       "3 × 40–60s",
       ""
      ],
      [
       "Hanging/Lying Leg Raise",
       "3 × 12–15",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 20",
       ""
      ],
      [
       "Russian Twist",
       "3 × 20",
       ""
      ],
      [
       "Side Plank",
       "3 × 30s/side",
       ""
      ],
      [
       "Pallof Press (anti-rotation)",
       "3 × 10/side",
       ""
      ],
      [
       "Reverse Crunch",
       "3 × 15",
       ""
      ]
     ]
    }
   },
   "variations": {
    "Flat chest press": {
     "bar": {
      "name": "Barbell Bench Press - Medium Grip",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg"
     },
     "cable": {
      "name": "Cable Chest Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Chest_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Chest_Press/1.jpg"
     },
     "machine": {
      "name": "Machine Bench Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/1.jpg"
     },
     "db": {
      "name": "Dumbbell Bench Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bench_Press/1.jpg"
     }
    },
    "Horizontal row": {
     "bar": {
      "name": "Bent Over Barbell Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Barbell_Row/1.jpg"
     },
     "cable": {
      "name": "Seated Cable Rows",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Cable_Rows/1.jpg"
     },
     "machine": {
      "name": "Leverage High Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/1.jpg"
     },
     "db": {
      "name": "One-Arm Dumbbell Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/One-Arm_Dumbbell_Row/1.jpg"
     }
    },
    "Overhead press": {
     "bar": {
      "name": "Standing Military Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Military_Press/1.jpg"
     },
     "cable": {
      "name": "Cable Shoulder Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shoulder_Press/1.jpg"
     },
     "machine": {
      "name": "Machine Shoulder (Military) Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/1.jpg"
     },
     "db": {
      "name": "Standing Dumbbell Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Press/1.jpg"
     }
    },
    "Vertical pull (lats)": {
     "bar": {
      "name": "Pullups",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/1.jpg"
     },
     "cable": {
      "name": "Wide-Grip Lat Pulldown",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Wide-Grip_Lat_Pulldown/1.jpg"
     },
     "db": {
      "name": "Bent Over Two-Dumbbell Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent_Over_Two-Dumbbell_Row/1.jpg"
     }
    },
    "Biceps curl": {
     "bar": {
      "name": "Barbell Curl",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Curl/1.jpg"
     },
     "cable": {
      "name": "Cable Hammer Curls - Rope Attachment",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg"
     },
     "machine": {
      "name": "Machine Bicep Curl",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/1.jpg"
     },
     "db": {
      "name": "Dumbbell Bicep Curl",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Bicep_Curl/1.jpg"
     }
    },
    "Triceps pushdown/ext": {
     "bar": {
      "name": "Lying Triceps Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Triceps_Press/1.jpg"
     },
     "cable": {
      "name": "Triceps Pushdown",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Triceps_Pushdown/1.jpg"
     },
     "machine": {
      "name": "Machine Triceps Extension",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"
     },
     "db": {
      "name": "Standing Dumbbell Triceps Extension",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/1.jpg"
     }
    },
    "Incline press": {
     "bar": {
      "name": "Barbell Incline Bench Press - Medium Grip",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg"
     },
     "cable": {
      "name": "Low Cable Crossover",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Low_Cable_Crossover/1.jpg"
     },
     "machine": {
      "name": "Leverage Incline Chest Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/1.jpg"
     },
     "db": {
      "name": "Incline Dumbbell Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Incline_Dumbbell_Press/1.jpg"
     }
    },
    "Side lateral raise": {
     "cable": {
      "name": "Cable Lateral Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Seated_Lateral_Raise/1.jpg"
     },
     "db": {
      "name": "Side Lateral Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Lateral_Raise/1.jpg"
     }
    },
    "Plank (core)": {
     "db": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Rear delts": {
     "cable": {
      "name": "Face Pull",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Face_Pull/1.jpg"
     },
     "machine": {
      "name": "Reverse Machine Flyes",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/1.jpg"
     },
     "db": {
      "name": "Seated Bent-Over Rear Delt Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Bent-Over_Rear_Delt_Raise/1.jpg"
     }
    },
    "Shrugs (traps)": {
     "bar": {
      "name": "Barbell Shrug",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Shrug/1.jpg"
     },
     "cable": {
      "name": "Cable Shrugs",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Shrugs/1.jpg"
     },
     "machine": {
      "name": "Leverage Shrug",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Shrug/1.jpg"
     },
     "db": {
      "name": "Dumbbell Shrug",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Shrug/1.jpg"
     }
    },
    "Hammer curl": {
     "cable": {
      "name": "Cable Hammer Curls - Rope Attachment",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg"
     },
     "machine": {
      "name": "Machine Bicep Curl",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bicep_Curl/1.jpg"
     },
     "db": {
      "name": "Hammer Curls",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hammer_Curls/1.jpg"
     }
    },
    "Squat": {
     "bar": {
      "name": "Barbell Full Squat",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Full_Squat/1.jpg"
     },
     "machine": {
      "name": "Leg Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
     },
     "db": {
      "name": "Dumbbell Squat",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Squat/1.jpg"
     }
    },
    "Leg raise (core)": {
     "bar": {
      "name": "Hanging Leg Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg"
     },
     "cable": {
      "name": "Cable Crunch",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/1.jpg"
     },
     "db": {
      "name": "Weighted Crunches",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Weighted_Crunches/1.jpg"
     }
    },
    "Chest fly": {
     "cable": {
      "name": "Cable Crossover",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crossover/1.jpg"
     },
     "machine": {
      "name": "Butterfly",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/1.jpg"
     },
     "db": {
      "name": "Dumbbell Flyes",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Flyes/1.jpg"
     }
    },
    "Chest dip": {
     "bw": {
      "name": "Dips - Chest Version",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dips_-_Chest_Version/1.jpg"
     },
     "machine": {
      "name": "Dip Machine",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/1.jpg"
     }
    },
    "Lat pullover / straight-arm": {
     "cable": {
      "name": "Straight-Arm Pulldown",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Straight-Arm_Pulldown/1.jpg"
     },
     "db": {
      "name": "Bent-Arm Dumbbell Pullover",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bent-Arm_Dumbbell_Pullover/1.jpg"
     }
    },
    "Front raise": {
     "bar": {
      "name": "Front Plate Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Plate_Raise/1.jpg"
     },
     "cable": {
      "name": "Front Cable Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Cable_Raise/1.jpg"
     },
     "db": {
      "name": "Front Dumbbell Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Front_Dumbbell_Raise/1.jpg"
     }
    },
    "Upright row": {
     "bar": {
      "name": "Upright Barbell Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Barbell_Row/1.jpg"
     },
     "cable": {
      "name": "Upright Cable Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Upright_Cable_Row/1.jpg"
     },
     "machine": {
      "name": "Smith Machine Upright Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Upright_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Upright_Row/1.jpg"
     },
     "db": {
      "name": "Standing Dumbbell Upright Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Upright_Row/1.jpg"
     }
    },
    "Overhead triceps": {
     "cable": {
      "name": "Cable Rope Overhead Triceps Extension",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Rope_Overhead_Triceps_Extension/1.jpg"
     },
     "machine": {
      "name": "Machine Triceps Extension",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/1.jpg"
     },
     "db": {
      "name": "Standing Dumbbell Triceps Extension",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Triceps_Extension/1.jpg"
     }
    },
    "Forearm / wrist": {
     "bar": {
      "name": "Palms-Up Barbell Wrist Curl Over A Bench",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Up_Barbell_Wrist_Curl_Over_A_Bench/1.jpg"
     },
     "db": {
      "name": "Palms-Down Dumbbell Wrist Curl Over A Bench",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Palms-Down_Dumbbell_Wrist_Curl_Over_A_Bench/1.jpg"
     }
    },
    "Lunge": {
     "bar": {
      "name": "Barbell Lunge",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Lunge/1.jpg"
     },
     "machine": {
      "name": "Leg Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/1.jpg"
     },
     "db": {
      "name": "Dumbbell Lunges",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dumbbell_Lunges/1.jpg"
     }
    },
    "Hamstring / RDL": {
     "bar": {
      "name": "Romanian Deadlift",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Romanian_Deadlift/1.jpg"
     },
     "machine": {
      "name": "Lying Leg Curls",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/1.jpg"
     },
     "db": {
      "name": "Stiff-Legged Dumbbell Deadlift",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Stiff-Legged_Dumbbell_Deadlift/1.jpg"
     }
    },
    "Calf raise": {
     "bar": {
      "name": "Standing Barbell Calf Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Barbell_Calf_Raise/1.jpg"
     },
     "machine": {
      "name": "Standing Calf Raises",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/1.jpg"
     },
     "db": {
      "name": "Standing Dumbbell Calf Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Dumbbell_Calf_Raise/1.jpg"
     }
    },
    "Plank": {
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Hanging/Lying Leg Raise": {
     "bar": {
      "name": "Hanging Leg Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hanging_Leg_Raise/1.jpg"
     },
     "cable": {
      "name": "Cable Crunch",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Cable_Crunch/1.jpg"
     },
     "bw": {
      "name": "Flat Bench Lying Leg Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/1.jpg"
     }
    },
    "Bicycle Crunch": {
     "bw": {
      "name": "Air Bike",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/1.jpg"
     }
    },
    "Russian Twist": {
     "db": {
      "name": "Russian Twist",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/1.jpg"
     },
     "bw": {
      "name": "Russian Twist",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/1.jpg"
     }
    },
    "Side Plank": {
     "bw": {
      "name": "Side Bridge",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/1.jpg"
     }
    },
    "Pallof Press (anti-rotation)": {
     "cable": {
      "name": "Pallof Press",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pallof_Press/1.jpg"
     },
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Reverse Crunch": {
     "bw": {
      "name": "Reverse Crunch",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg"
     }
    }
   },
   "cues": {
    "Barbell Bench Press - Medium Grip": "Bar to mid-chest, elbows ~45°, press up.",
    "Cable Chest Press": "Press cable handles forward, squeeze chest.",
    "Dumbbell Bench Press": "DBs at chest, press up and slightly together.",
    "Bent Over Barbell Row": "Hinge, row bar to lower ribs, squeeze blades.",
    "Seated Cable Rows": "Row to torso, squeeze shoulder blades, don't lean back much.",
    "One-Arm Dumbbell Row": "Hand on bench, row DB to hip, squeeze.",
    "Standing Military Press": "Press bar overhead from shoulders, brace core.",
    "Standing Palms-In Dumbbell Press": "Neutral-grip DB press overhead.",
    "Standing Dumbbell Press": "Press DBs overhead, don't over-flare.",
    "Pullups": "Pull chin over bar. Band-assist if needed.",
    "Wide-Grip Lat Pulldown": "Pull bar to upper chest, drive elbows down, control up.",
    "Bent Over Two-Dumbbell Row": "Hinge, row both DBs to hips, squeeze.",
    "Barbell Curl": "Curl bar, no swing, squeeze at top.",
    "Cable Hammer Curls - Rope Attachment": "Neutral grip, curl rope up, control down.",
    "Dumbbell Bicep Curl": "Curl DBs, squeeze top, control down.",
    "Lying Triceps Press": "Skull-crusher: lower bar to forehead, extend.",
    "Triceps Pushdown": "Elbows pinned, push down, full extension, control up.",
    "Standing Dumbbell Triceps Extension": "DB overhead, extend up, elbows still.",
    "Barbell Incline Bench Press - Medium Grip": "Incline bar press for upper chest.",
    "Low Cable Crossover": "Low-to-high cable flye for upper chest.",
    "Incline Dumbbell Press": "Bench ~30°, press DBs up and together.",
    "Cable Seated Lateral Raise": "Seated cable raise out to the side.",
    "Side Lateral Raise": "Raise out to shoulder height, slight bend. Light.",
    "Plank": "Forearms down, body straight, brace abs, hold. Don't let hips sag.",
    "Face Pull": "Rope to face, elbows high — great for skater shoulders.",
    "Seated Bent-Over Rear Delt Raise": "Hinge seated, raise DBs out, squeeze rear delts.",
    "Barbell Shrug": "Shrug shoulders up, squeeze traps, lower.",
    "Cable Shrugs": "",
    "Dumbbell Shrug": "Shrug DBs up, squeeze traps.",
    "Hammer Curls": "Neutral grip curl — biceps + forearm.",
    "Barbell Full Squat": "Bar on back, sit down to depth, drive up.",
    "Dumbbell Squat": "DBs at sides, squat down, stand.",
    "Hanging Leg Raise": "Hang, raise legs with control, no swinging.",
    "Cable Crunch": "Kneel, crunch down pulling rope, contract abs hard.",
    "Weighted Crunches": "Crunch holding weight on chest.",
    "Cable Crossover": "Bring handles together in front, squeeze.",
    "Dumbbell Flyes": "Wide arc, slight elbow bend, squeeze at top.",
    "Dips - Chest Version": "Lean forward on dip bars, lower, press up (chest).",
    "Straight-Arm Pulldown": "Arms straight, pull bar down to thighs using lats.",
    "Bent-Arm Dumbbell Pullover": "",
    "Front Plate Raise": "Raise plate to front to eye level.",
    "Front Cable Raise": "Cable raise to front, control.",
    "Front Dumbbell Raise": "Raise DB to front to shoulder height.",
    "Upright Barbell Row": "Pull bar up along body to chest, elbows high.",
    "Upright Cable Row": "Cable pull up to chest, elbows lead.",
    "Standing Dumbbell Upright Row": "",
    "Cable Rope Overhead Triceps Extension": "Rope overhead, extend arms up, stretch at bottom.",
    "Palms-Up Barbell Wrist Curl Over A Bench": "",
    "Palms-Down Dumbbell Wrist Curl Over A Bench": "",
    "Barbell Lunge": "Bar on back, lunge forward, push up.",
    "Dumbbell Lunges": "Step forward with DBs, drop knee, push up.",
    "Romanian Deadlift": "Hinge at hips, bar down shins, drive up. Hamstrings.",
    "Stiff-Legged Dumbbell Deadlift": "Near-straight legs, hinge with DBs.",
    "Standing Barbell Calf Raise": "Rise onto toes with bar, squeeze, lower slow.",
    "Standing Dumbbell Calf Raise": "Rise onto toes with DBs, squeeze.",
    "Cable Shoulder Press": "Press cable handles overhead from shoulder height, control down.",
    "Flat Bench Lying Leg Raise": "Lie down, raise legs with control, lower slow.",
    "Air Bike": "Alternate elbow to opposite knee, slow and controlled.",
    "Russian Twist": "Seated, lean back, rotate side to side. Add weight to progress.",
    "Side Bridge": "On side, forearm down, hips up, straight line, hold.",
    "Pallof Press": "Cable/band from the side, press straight out, resist the twist.",
    "Reverse Crunch": "Knees up, curl hips toward chest, control down.",
    "Machine Bench Press": "Seated, press handles forward, control back to chest level.",
    "Leverage Incline Chest Press": "Incline machine, press up and in, squeeze chest.",
    "Butterfly": "Pec deck: bring pads together in front, squeeze, slow return.",
    "Machine Shoulder (Military) Press": "Press handles overhead, don't shrug, control down.",
    "Smith Machine Upright Row": "Pull bar up to chest height, elbows lead, lower slow.",
    "Reverse Machine Flyes": "Face pad, open arms back squeezing rear delts.",
    "Machine Bicep Curl": "Curl handles up, squeeze biceps, slow negative.",
    "Dip Machine": "",
    "Leg Press": "Feet shoulder-width, lower to ~90°, press through heels, don't lock hard.",
    "Lying Leg Curls": "Curl pad to glutes, squeeze hamstrings, slow release.",
    "Standing Calf Raises": "Rise onto toes, full squeeze, slow stretch down.",
    "Cable Wrist Curl": "Curl the wrists up, slow down, full range.",
    "Leverage High Row": "Chest on pad, drive elbows back, squeeze shoulder blades.",
    "Machine Triceps Extension": "Elbows fixed, extend arms fully, control the return.",
    "Leverage Shrug": "Grip handles, shrug shoulders straight up, hold, lower slow."
   }
  },
  "cal": {
   "label": "Calisthenics",
   "icon": "🤸",
   "sessions": {
    "fullupper": {
     "name": "Full Upper",
     "emoji": "💪",
     "group": "broad",
     "muscles": "chest·back·shoulders·arms",
     "slots": [
      [
       "Flat chest press",
       "4 × 8–10",
       ""
      ],
      [
       "Horizontal row",
       "4 × 8–10",
       ""
      ],
      [
       "Overhead press",
       "3 × 8–12",
       ""
      ],
      [
       "Vertical pull (lats)",
       "3 × 8–10",
       ""
      ],
      [
       "Biceps curl",
       "3 × 10–12",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "3 × 10–12",
       ""
      ]
     ]
    },
    "push": {
     "name": "Push",
     "emoji": "🙌",
     "group": "broad",
     "muscles": "chest·shoulders·triceps + core",
     "slots": [
      [
       "Flat chest press",
       "4 × 6–10",
       "5 × 3–5 heavy"
      ],
      [
       "Incline press",
       "3 × 8–12",
       ""
      ],
      [
       "Overhead press",
       "3 × 8–12",
       ""
      ],
      [
       "Side lateral raise",
       "3 × 12–15",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "3 × 10–12",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "pull": {
     "name": "Pull",
     "emoji": "🧲",
     "group": "broad",
     "muscles": "back·biceps·rear delts",
     "slots": [
      [
       "Vertical pull (lats)",
       "4 × 6–10",
       "weighted 5 × 3–5"
      ],
      [
       "Horizontal row",
       "4 × 8–10",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ],
      [
       "Shrugs (traps)",
       "3 × 12–15",
       ""
      ],
      [
       "Biceps curl",
       "3 × 10–12",
       ""
      ],
      [
       "Hammer curl",
       "3 × 10–12",
       ""
      ]
     ]
    },
    "fullbody": {
     "name": "Full Body",
     "emoji": "🔥",
     "group": "broad",
     "muscles": "a bit of everything (short/travel)",
     "slots": [
      [
       "Squat",
       "3 × 10–12",
       ""
      ],
      [
       "Flat chest press",
       "3 × 8–12",
       ""
      ],
      [
       "Horizontal row",
       "3 × 8–12",
       ""
      ],
      [
       "Overhead press",
       "3 × 10–12",
       ""
      ],
      [
       "Leg raise (core)",
       "3 × 12–15",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "chest": {
     "name": "Chest",
     "emoji": "🎯",
     "group": "focused",
     "muscles": "chest · triceps assist",
     "slots": [
      [
       "Flat chest press",
       "4 × 6–10",
       "5 × 3–5 heavy"
      ],
      [
       "Incline press",
       "3 × 8–12",
       ""
      ],
      [
       "Chest fly",
       "3 × 12–15",
       ""
      ],
      [
       "Chest dip",
       "3 × 8–12",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45s",
       ""
      ]
     ]
    },
    "back": {
     "name": "Back",
     "emoji": "🪃",
     "group": "focused",
     "muscles": "lats · traps · rear delts",
     "slots": [
      [
       "Vertical pull (lats)",
       "4 × 6–10",
       "weighted 5 × 3–5"
      ],
      [
       "Horizontal row",
       "4 × 8–12",
       ""
      ],
      [
       "Lat pullover / straight-arm",
       "3 × 12–15",
       ""
      ],
      [
       "Shrugs (traps)",
       "3 × 12–15",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ]
     ]
    },
    "shoulders": {
     "name": "Shoulders",
     "emoji": "🔺",
     "group": "focused",
     "muscles": "delts (front·side·rear)",
     "slots": [
      [
       "Overhead press",
       "4 × 6–10",
       "5 × 4–6 heavy"
      ],
      [
       "Side lateral raise",
       "4 × 12–20",
       ""
      ],
      [
       "Front raise",
       "3 × 10–15",
       ""
      ],
      [
       "Upright row",
       "3 × 10–12",
       ""
      ],
      [
       "Rear delts",
       "3 × 15",
       ""
      ]
     ]
    },
    "arms": {
     "name": "Arms",
     "emoji": "💥",
     "group": "focused",
     "muscles": "biceps · triceps · forearms",
     "slots": [
      [
       "Biceps curl",
       "4 × 8–12",
       ""
      ],
      [
       "Triceps pushdown/ext",
       "4 × 8–12",
       ""
      ],
      [
       "Hammer curl",
       "3 × 10–12",
       ""
      ],
      [
       "Overhead triceps",
       "3 × 10–12",
       ""
      ],
      [
       "Forearm / wrist",
       "3 × 15–20",
       ""
      ]
     ]
    },
    "legs": {
     "name": "Legs & Core",
     "emoji": "🦵",
     "group": "focused",
     "muscles": "legs (maintenance) · core",
     "slots": [
      [
       "Squat",
       "3 × 8–12",
       ""
      ],
      [
       "Lunge",
       "3 × 12/leg",
       ""
      ],
      [
       "Hamstring / RDL",
       "3 × 10–12",
       ""
      ],
      [
       "Calf raise",
       "3 × 15–20",
       ""
      ],
      [
       "Leg raise (core)",
       "3 × 12–15",
       ""
      ],
      [
       "Plank (core)",
       "3 × 45–60s",
       ""
      ]
     ]
    },
    "core": {
     "name": "Core",
     "emoji": "🎯",
     "group": "focused",
     "muscles": "abs · obliques · lower back",
     "slots": [
      [
       "Plank",
       "3 × 40–60s",
       ""
      ],
      [
       "Hanging/Lying Leg Raise",
       "3 × 12–15",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 20",
       ""
      ],
      [
       "Russian Twist",
       "3 × 20",
       ""
      ],
      [
       "Side Plank",
       "3 × 30s/side",
       ""
      ],
      [
       "Pallof Press (anti-rotation)",
       "3 × 10/side",
       ""
      ],
      [
       "Reverse Crunch",
       "3 × 15",
       ""
      ]
     ]
    }
   },
   "variations": {
    "Flat chest press": {
     "bw": {
      "name": "Pushups",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/1.jpg"
     }
    },
    "Horizontal row": {
     "bw": {
      "name": "Inverted Row",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Inverted_Row/1.jpg"
     }
    },
    "Overhead press": {
     "bw": {
      "name": "Decline Push-Up",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
     }
    },
    "Vertical pull (lats)": {
     "bw": {
      "name": "Pullups",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pullups/1.jpg"
     }
    },
    "Biceps curl": {
     "bw": {
      "name": "Chin-Up",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/1.jpg"
     }
    },
    "Triceps pushdown/ext": {
     "bw": {
      "name": "Bench Dips",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
     }
    },
    "Incline press": {
     "bw": {
      "name": "Decline Push-Up",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
     }
    },
    "Side lateral raise": {
     "bw": {
      "name": "Lateral Raise - With Bands",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lateral_Raise_-_With_Bands/1.jpg"
     }
    },
    "Plank (core)": {
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Rear delts": {
     "bw": {
      "name": "Band Pull Apart",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/1.jpg"
     }
    },
    "Shrugs (traps)": {
     "bw": {
      "name": "Superman",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/1.jpg"
     }
    },
    "Hammer curl": {
     "bw": {
      "name": "Chin-Up",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Chin-Up/1.jpg"
     }
    },
    "Squat": {
     "bw": {
      "name": "Bodyweight Squat",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Squat/1.jpg"
     }
    },
    "Leg raise (core)": {
     "bw": {
      "name": "Flat Bench Lying Leg Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/1.jpg"
     }
    },
    "Chest fly": {
     "bw": {
      "name": "Pushups",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Pushups/1.jpg"
     }
    },
    "Chest dip": {
     "bw": {
      "name": "Bench Dips",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
     }
    },
    "Lat pullover / straight-arm": {
     "bw": {
      "name": "Superman",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Superman/1.jpg"
     }
    },
    "Front raise": {
     "bw": {
      "name": "Decline Push-Up",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Decline_Push-Up/1.jpg"
     }
    },
    "Upright row": {
     "bw": {
      "name": "Band Pull Apart",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Band_Pull_Apart/1.jpg"
     }
    },
    "Overhead triceps": {
     "bw": {
      "name": "Bench Dips",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bench_Dips/1.jpg"
     }
    },
    "Forearm / wrist": {
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Lunge": {
     "bw": {
      "name": "Bodyweight Walking Lunge",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Bodyweight_Walking_Lunge/1.jpg"
     }
    },
    "Hamstring / RDL": {
     "bw": {
      "name": "Butt Lift (Bridge)",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butt_Lift_Bridge/1.jpg"
     }
    },
    "Calf raise": {
     "bw": {
      "name": "Donkey Calf Raises",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Donkey_Calf_Raises/1.jpg"
     }
    },
    "Plank": {
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Hanging/Lying Leg Raise": {
     "bw": {
      "name": "Flat Bench Lying Leg Raise",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Flat_Bench_Lying_Leg_Raise/1.jpg"
     }
    },
    "Bicycle Crunch": {
     "bw": {
      "name": "Air Bike",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Air_Bike/1.jpg"
     }
    },
    "Russian Twist": {
     "bw": {
      "name": "Russian Twist",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Russian_Twist/1.jpg"
     }
    },
    "Side Plank": {
     "bw": {
      "name": "Side Bridge",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Side_Bridge/1.jpg"
     }
    },
    "Pallof Press (anti-rotation)": {
     "bw": {
      "name": "Plank",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"
     }
    },
    "Reverse Crunch": {
     "bw": {
      "name": "Reverse Crunch",
      "img": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/0.jpg",
      "img2": "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Crunch/1.jpg"
     }
    }
   },
   "cues": {
    "Pushups": "Body straight, chest to floor, press up. Feet up = harder.",
    "Inverted Row": "Under a bar/table, pull chest up, body straight.",
    "Decline Push-Up": "Feet elevated push-up — hits shoulders/upper chest.",
    "Pullups": "Pull chin over bar. Band-assist if needed.",
    "Chin-Up": "Underhand pull-up — biceps + back.",
    "Bench Dips": "Hands on bench behind you, lower & press up.",
    "Side Lateral Raise": "Raise out to shoulder height, slight bend. Light.",
    "Plank": "Forearms down, body straight, brace abs, hold. Don't let hips sag.",
    "Band Pull Apart": "Band at chest, pull apart, squeeze blades.",
    "Superman": "Face down, lift chest+legs, squeeze, lower.",
    "Bodyweight Squat": "Sit back and down, knees track toes, stand.",
    "Flat Bench Lying Leg Raise": "Lie down, raise legs with control, lower slow.",
    "Bodyweight Walking Lunge": "Step forward, drop back knee, alternate.",
    "Butt Lift (Bridge)": "On back, drive hips up, squeeze glutes.",
    "Standing Calf Raises": "Rise onto toes, squeeze, lower slow. On a step for range.",
    "Air Bike": "Alternate elbow to opposite knee, slow and controlled.",
    "Russian Twist": "Seated, lean back, rotate side to side. Add weight to progress.",
    "Side Bridge": "On side, forearm down, hips up, straight line, hold.",
    "Reverse Crunch": "Knees up, curl hips toward chest, control down.",
    "Lateral Raise - With Bands": "Hold bands underfoot, raise arms out to shoulder height, control down.",
    "Donkey Calf Raises": "Bend at hips, raise onto toes, full squeeze, slow stretch — bodyweight."
   }
  },
  "travel": {
   "label": "Travel",
   "icon": "✈️",
   "sessions": {
    "fullbody_easy": {
     "name": "Full Body · Easy",
     "emoji": "🔥",
     "group": "broad",
     "muscles": "everything · beginner · 15 min",
     "slots": [
      [
       "Squat",
       "3 × 12",
       ""
      ],
      [
       "Push-up",
       "3 × 8",
       ""
      ],
      [
       "Lunge",
       "3 × 10 each",
       ""
      ],
      [
       "Superman",
       "3 × 15",
       ""
      ],
      [
       "Plank",
       "3 × 30s",
       ""
      ]
     ]
    },
    "fullbody_med": {
     "name": "Full Body · Medium",
     "emoji": "🔥",
     "group": "broad",
     "muscles": "everything · intermediate · 25 min",
     "slots": [
      [
       "Squat",
       "3 × 15",
       ""
      ],
      [
       "Push-up",
       "4 × 12",
       ""
      ],
      [
       "Lunge",
       "3 × 12 each",
       ""
      ],
      [
       "Diamond Push-up",
       "3 × 10",
       ""
      ],
      [
       "Superman",
       "3 × 15",
       ""
      ],
      [
       "Plank",
       "3 × 45s",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 20",
       ""
      ]
     ]
    },
    "fullbody_hard": {
     "name": "Full Body · Hard",
     "emoji": "🔥",
     "group": "broad",
     "muscles": "everything · advanced · 35 min",
     "slots": [
      [
       "Pistol Squat",
       "3 × 6 each",
       ""
      ],
      [
       "Archer Push-up",
       "3 × 6 each",
       ""
      ],
      [
       "Sissy Squat",
       "3 × 12",
       ""
      ],
      [
       "Handstand Push-up",
       "4 × 8",
       ""
      ],
      [
       "Plyo Push-up",
       "3 × 8",
       ""
      ],
      [
       "L-Sit Hold",
       "3 × 20s",
       ""
      ]
     ]
    },
    "push_easy": {
     "name": "Push · Easy",
     "emoji": "💥",
     "group": "broad",
     "muscles": "chest · shoulders · triceps · beginner · 15 min",
     "slots": [
      [
       "Push-up",
       "3 × 8",
       ""
      ],
      [
       "Diamond Push-up",
       "3 × 6",
       ""
      ],
      [
       "Kneeling Triceps Ext",
       "3 × 10",
       ""
      ],
      [
       "Rear Delt Stretch",
       "3 × 30s",
       ""
      ]
     ]
    },
    "push_med": {
     "name": "Push · Medium",
     "emoji": "💥",
     "group": "broad",
     "muscles": "chest · shoulders · triceps · 25 min",
     "slots": [
      [
       "Push-up",
       "4 × 12",
       ""
      ],
      [
       "Handstand Push-up",
       "3 × 8",
       ""
      ],
      [
       "Diamond Push-up",
       "3 × 10",
       ""
      ],
      [
       "Hindu Push-up",
       "3 × 10",
       ""
      ],
      [
       "Close-grip Push-up",
       "3 × 10",
       ""
      ],
      [
       "Plank",
       "3 × 45s",
       ""
      ]
     ]
    },
    "push_hard": {
     "name": "Push · Hard",
     "emoji": "💥",
     "group": "broad",
     "muscles": "chest · shoulders · triceps · advanced · 35 min",
     "slots": [
      [
       "Handstand Push-up",
       "4 × 10",
       ""
      ],
      [
       "Archer Push-up",
       "3 × 8 each",
       ""
      ],
      [
       "Plyo Push-up",
       "3 × 10",
       ""
      ],
      [
       "Diamond Push-up",
       "3 × 15",
       ""
      ],
      [
       "Clap Push-up",
       "3 × 6",
       ""
      ],
      [
       "Single Arm Push-up",
       "3 × 5 each",
       ""
      ]
     ]
    },
    "pull_easy": {
     "name": "Pull · Easy",
     "emoji": "🎯",
     "group": "broad",
     "muscles": "back · rear delts · postural · 10 min",
     "slots": [
      [
       "Cobra (Upward Dog)",
       "3 × 12",
       ""
      ],
      [
       "Rear Delt Stretch",
       "3 × 30s",
       ""
      ],
      [
       "Sphinx",
       "3 × 30s",
       ""
      ],
      [
       "Standing Archer",
       "3 × 10 each",
       ""
      ]
     ]
    },
    "pull_med": {
     "name": "Pull · Medium",
     "emoji": "🎯",
     "group": "broad",
     "muscles": "back · rear delts · postural · 15 min",
     "slots": [
      [
       "Cobra (Upward Dog)",
       "3 × 15",
       ""
      ],
      [
       "Lower Back Curl",
       "3 × 15",
       ""
      ],
      [
       "Standing Archer",
       "3 × 12 each",
       ""
      ],
      [
       "Plank (postural)",
       "3 × 45s",
       ""
      ],
      [
       "Rear Delt Stretch",
       "3 × 30s",
       ""
      ]
     ]
    },
    "legs_easy": {
     "name": "Legs · Easy",
     "emoji": "🦵",
     "group": "broad",
     "muscles": "legs · glutes · beginner · 15 min",
     "slots": [
      [
       "Squat",
       "3 × 15",
       ""
      ],
      [
       "Walking Lunge",
       "3 × 12 each",
       ""
      ],
      [
       "Glute Bridge",
       "3 × 15",
       ""
      ],
      [
       "Standing Calf Raise",
       "3 × 20",
       ""
      ]
     ]
    },
    "legs_med": {
     "name": "Legs · Medium",
     "emoji": "🦵",
     "group": "broad",
     "muscles": "legs · glutes · 25 min",
     "slots": [
      [
       "Squat",
       "4 × 20",
       ""
      ],
      [
       "Walking Lunge",
       "3 × 15 each",
       ""
      ],
      [
       "Split Squats",
       "3 × 12 each",
       ""
      ],
      [
       "Standing Single Leg Curl",
       "3 × 12 each",
       ""
      ],
      [
       "Standing Calf Raise",
       "4 × 20",
       ""
      ],
      [
       "Glute Bridge",
       "3 × 15",
       ""
      ]
     ]
    },
    "legs_hard": {
     "name": "Legs · Hard",
     "emoji": "🦵",
     "group": "broad",
     "muscles": "legs · glutes · advanced · 35 min",
     "slots": [
      [
       "Pistol Squat",
       "4 × 8 each",
       ""
      ],
      [
       "Sissy Squat",
       "3 × 15",
       ""
      ],
      [
       "Split Squats",
       "3 × 15 each",
       ""
      ],
      [
       "Curtsey Squat",
       "3 × 10 each",
       ""
      ],
      [
       "Single Leg Bridge",
       "3 × 12 each",
       ""
      ],
      [
       "Standing Single Leg Curl",
       "3 × 15 each",
       ""
      ],
      [
       "Standing Calf Raise",
       "4 × 25",
       ""
      ]
     ]
    },
    "core_easy": {
     "name": "Core · Easy",
     "emoji": "🎯",
     "group": "broad",
     "muscles": "abs · core · beginner · 12 min",
     "slots": [
      [
       "Plank",
       "3 × 30s",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 15",
       ""
      ],
      [
       "Russian Twist",
       "3 × 20",
       ""
      ],
      [
       "Glute Bridge",
       "3 × 12",
       ""
      ]
     ]
    },
    "core_med": {
     "name": "Core · Medium",
     "emoji": "🎯",
     "group": "broad",
     "muscles": "abs · core · obliques · 20 min",
     "slots": [
      [
       "Plank",
       "3 × 60s",
       ""
      ],
      [
       "Side Plank",
       "3 × 45s each",
       ""
      ],
      [
       "Reverse Crunch",
       "3 × 15",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 20",
       ""
      ],
      [
       "Russian Twist",
       "3 × 25",
       ""
      ],
      [
       "Lying Leg-Hip Raise",
       "3 × 12",
       ""
      ]
     ]
    },
    "core_hard": {
     "name": "Core · Hard",
     "emoji": "🎯",
     "group": "broad",
     "muscles": "abs · core · elite · 25 min",
     "slots": [
      [
       "L-Sit Hold",
       "5 × 20s",
       ""
      ],
      [
       "V-Sit Hold",
       "3 × 30s",
       ""
      ],
      [
       "Plank with Twist",
       "3 × 12 each",
       ""
      ],
      [
       "Side Plank",
       "3 × 60s each",
       ""
      ],
      [
       "Decline Crunch",
       "3 × 15",
       ""
      ],
      [
       "Reverse Crunch",
       "3 × 20",
       ""
      ]
     ]
    },
    "hiit_med": {
     "name": "HIIT · Medium",
     "emoji": "⚡",
     "group": "broad",
     "muscles": "legs · everything · cardio · 20 min",
     "slots": [
      [
       "Burpee",
       "5 × 10",
       ""
      ],
      [
       "Jack Jump",
       "5 × 20",
       ""
      ],
      [
       "Bear Crawl",
       "5 × 30s",
       ""
      ],
      [
       "Plyo Push-up",
       "4 × 8",
       ""
      ],
      [
       "Squat",
       "5 × 20",
       ""
      ]
     ]
    },
    "hiit_hard": {
     "name": "HIIT · Hard",
     "emoji": "⚡",
     "group": "broad",
     "muscles": "legs · everything · cardio advanced · 30 min",
     "slots": [
      [
       "Burpee",
       "6 × 15",
       ""
      ],
      [
       "Clap Push-up",
       "5 × 8",
       ""
      ],
      [
       "Star Jump",
       "5 × 20",
       ""
      ],
      [
       "Bear Crawl",
       "5 × 45s",
       ""
      ],
      [
       "Plyo Push-up",
       "5 × 10",
       ""
      ],
      [
       "Pistol Squat",
       "4 × 6 each",
       ""
      ],
      [
       "Jack Jump",
       "5 × 25",
       ""
      ]
     ]
    },
    "quick_easy": {
     "name": "Quick 15",
     "emoji": "⚡",
     "group": "broad",
     "muscles": "everything · quick · 10-15 min",
     "slots": [
      [
       "Push-up",
       "3 × 10",
       ""
      ],
      [
       "Squat",
       "3 × 15",
       ""
      ],
      [
       "Plank",
       "3 × 30s",
       ""
      ],
      [
       "Bicycle Crunch",
       "3 × 15",
       ""
      ]
     ]
    }
   },
   "variations": {
    "Archer Push-up": {
     "bw": {
      "name": "Archer Push-up",
      "img": "./exercise-media/posters/A9qxk2F.jpg",
      "img2": "./exercise-media/posters/A9qxk2F.jpg"
     }
    },
    "Bear Crawl": {
     "bw": {
      "name": "Bear Crawl",
      "img": "./exercise-media/posters/0Yz8WdV.jpg",
      "img2": "./exercise-media/posters/0Yz8WdV.jpg"
     }
    },
    "Bicycle Crunch": {
     "bw": {
      "name": "Air Bike",
      "img": "./exercise-media/posters/1ZFqTDN.jpg",
      "img2": "./exercise-media/posters/1ZFqTDN.jpg"
     }
    },
    "Burpee": {
     "bw": {
      "name": "Burpee",
      "img": "./exercise-media/posters/dK9394r.jpg",
      "img2": "./exercise-media/posters/dK9394r.jpg"
     }
    },
    "Clap Push-up": {
     "bw": {
      "name": "Clap Push-up",
      "img": "./exercise-media/posters/wigSg76.jpg",
      "img2": "./exercise-media/posters/wigSg76.jpg"
     }
    },
    "Close-grip Push-up": {
     "bw": {
      "name": "Close-grip Push-up",
      "img": "./exercise-media/posters/x6KpKpq.jpg",
      "img2": "./exercise-media/posters/x6KpKpq.jpg"
     }
    },
    "Cobra (Upward Dog)": {
     "bw": {
      "name": "Cobra Upward Dog",
      "img": "./exercise-media/posters/01qpYSe.jpg",
      "img2": "./exercise-media/posters/01qpYSe.jpg"
     }
    },
    "Curtsey Squat": {
     "bw": {
      "name": "Curtsey Squat",
      "img": "./exercise-media/posters/gUjqdei.jpg",
      "img2": "./exercise-media/posters/gUjqdei.jpg"
     }
    },
    "Decline Crunch": {
     "bw": {
      "name": "Decline Crunch",
      "img": "./exercise-media/posters/9Ap7miY.jpg",
      "img2": "./exercise-media/posters/9Ap7miY.jpg"
     }
    },
    "Diamond Push-up": {
     "bw": {
      "name": "Diamond Push-Up",
      "img": "./exercise-media/posters/soIB2rj.jpg",
      "img2": "./exercise-media/posters/soIB2rj.jpg"
     }
    },
    "Glute Bridge": {
     "bw": {
      "name": "Glute Bridge March",
      "img": "./exercise-media/posters/GibBPPg.jpg",
      "img2": "./exercise-media/posters/GibBPPg.jpg"
     }
    },
    "Handstand Push-up": {
     "bw": {
      "name": "Handstand Push-Up",
      "img": "./exercise-media/posters/rQxwMxO.jpg",
      "img2": "./exercise-media/posters/rQxwMxO.jpg"
     }
    },
    "Hindu Push-up": {
     "bw": {
      "name": "Hindu Push-up",
      "img": "./exercise-media/posters/epOSYUZ.jpg",
      "img2": "./exercise-media/posters/epOSYUZ.jpg"
     }
    },
    "Jack Jump": {
     "bw": {
      "name": "Jack Jump",
      "img": "./exercise-media/posters/1g5bPpA.jpg",
      "img2": "./exercise-media/posters/1g5bPpA.jpg"
     }
    },
    "Kneeling Triceps Ext": {
     "bw": {
      "name": "Kneeling Triceps Extension",
      "img": "./exercise-media/posters/s0HKO2I.jpg",
      "img2": "./exercise-media/posters/s0HKO2I.jpg"
     }
    },
    "L-Sit Hold": {
     "bw": {
      "name": "L-Sit on Floor",
      "img": "./exercise-media/posters/UpWmA5E.jpg",
      "img2": "./exercise-media/posters/UpWmA5E.jpg"
     }
    },
    "Lower Back Curl": {
     "bw": {
      "name": "Lower Back Curl",
      "img": "./exercise-media/posters/ANbbry2.jpg",
      "img2": "./exercise-media/posters/ANbbry2.jpg"
     }
    },
    "Lunge": {
     "bw": {
      "name": "Bodyweight Walking Lunge",
      "img": "./exercise-media/posters/IZVHb27.jpg",
      "img2": "./exercise-media/posters/IZVHb27.jpg"
     }
    },
    "Lying Leg-Hip Raise": {
     "bw": {
      "name": "Lying Leg-Hip Raise",
      "img": "./exercise-media/posters/9IxJdtC.jpg",
      "img2": "./exercise-media/posters/9IxJdtC.jpg"
     }
    },
    "Pistol Squat": {
     "bw": {
      "name": "Pistol Squat",
      "img": "./exercise-media/posters/nqs5HGV.jpg",
      "img2": "./exercise-media/posters/nqs5HGV.jpg"
     }
    },
    "Plank": {
     "bw": {
      "name": "Plank",
      "img": "./exercise-media/posters/hCjGsRQ.jpg",
      "img2": "./exercise-media/posters/hCjGsRQ.jpg"
     }
    },
    "Plank (postural)": {
     "bw": {
      "name": "Plank",
      "img": "./exercise-media/posters/hCjGsRQ.jpg",
      "img2": "./exercise-media/posters/hCjGsRQ.jpg"
     }
    },
    "Plank with Twist": {
     "bw": {
      "name": "Plank with Twist",
      "img": "./exercise-media/posters/CosupLu.jpg",
      "img2": "./exercise-media/posters/CosupLu.jpg"
     }
    },
    "Plyo Push-up": {
     "bw": {
      "name": "Plyo Push-up",
      "img": "./exercise-media/posters/Snj1wSv.jpg",
      "img2": "./exercise-media/posters/Snj1wSv.jpg"
     }
    },
    "Push-up": {
     "bw": {
      "name": "Pushups",
      "img": "./exercise-media/posters/I4hDWkc.jpg",
      "img2": "./exercise-media/posters/I4hDWkc.jpg"
     }
    },
    "Rear Delt Stretch": {
     "bw": {
      "name": "Rear Deltoid Stretch",
      "img": "./exercise-media/posters/xifhB5W.jpg",
      "img2": "./exercise-media/posters/xifhB5W.jpg"
     }
    },
    "Reverse Crunch": {
     "bw": {
      "name": "Reverse Crunch",
      "img": "./exercise-media/posters/nCU1Ekp.jpg",
      "img2": "./exercise-media/posters/nCU1Ekp.jpg"
     }
    },
    "Russian Twist": {
     "bw": {
      "name": "Russian Twist",
      "img": "./exercise-media/posters/XVDdcoj.jpg",
      "img2": "./exercise-media/posters/XVDdcoj.jpg"
     }
    },
    "Side Plank": {
     "bw": {
      "name": "Side Bridge",
      "img": "./exercise-media/posters/RKjH6Lt.jpg",
      "img2": "./exercise-media/posters/RKjH6Lt.jpg"
     }
    },
    "Single Arm Push-up": {
     "bw": {
      "name": "Single Arm Push-up",
      "img": "./exercise-media/posters/MUic5zN.jpg",
      "img2": "./exercise-media/posters/MUic5zN.jpg"
     }
    },
    "Single Leg Bridge": {
     "bw": {
      "name": "Single Leg Bridge",
      "img": "./exercise-media/posters/rmEukuS.jpg",
      "img2": "./exercise-media/posters/rmEukuS.jpg"
     }
    },
    "Sissy Squat": {
     "bw": {
      "name": "Sissy Squat",
      "img": "./exercise-media/posters/xdYPUtE.jpg",
      "img2": "./exercise-media/posters/xdYPUtE.jpg"
     }
    },
    "Sphinx": {
     "bw": {
      "name": "Sphinx",
      "img": "./exercise-media/posters/DIVyqrU.jpg",
      "img2": "./exercise-media/posters/DIVyqrU.jpg"
     }
    },
    "Split Squats": {
     "bw": {
      "name": "Split Squats",
      "img": "./exercise-media/posters/9E25EOx.jpg",
      "img2": "./exercise-media/posters/9E25EOx.jpg"
     }
    },
    "Squat": {
     "bw": {
      "name": "Squat",
      "img": "./exercise-media/posters/QChZi3x.jpg",
      "img2": "./exercise-media/posters/QChZi3x.jpg"
     }
    },
    "Standing Archer": {
     "bw": {
      "name": "Standing Archer",
      "img": "./exercise-media/posters/JF8AkMX.jpg",
      "img2": "./exercise-media/posters/JF8AkMX.jpg"
     }
    },
    "Standing Calf Raise": {
     "bw": {
      "name": "Bodyweight Standing Calf Raise",
      "img": "./exercise-media/posters/bJYHBIN.jpg",
      "img2": "./exercise-media/posters/bJYHBIN.jpg"
     }
    },
    "Standing Single Leg Curl": {
     "bw": {
      "name": "Standing Single Leg Curl",
      "img": "./exercise-media/posters/C5jncD2.jpg",
      "img2": "./exercise-media/posters/C5jncD2.jpg"
     }
    },
    "Star Jump": {
     "bw": {
      "name": "Star Jump",
      "img": "./exercise-media/posters/HtfCpfi.jpg",
      "img2": "./exercise-media/posters/HtfCpfi.jpg"
     }
    },
    "Superman": {
     "bw": {
      "name": "Superman",
      "img": "./exercise-media/posters/01qpYSe.jpg",
      "img2": "./exercise-media/posters/01qpYSe.jpg"
     }
    },
    "V-Sit Hold": {
     "bw": {
      "name": "V-Sit on Floor",
      "img": "./exercise-media/posters/ZuXu4Eq.jpg",
      "img2": "./exercise-media/posters/ZuXu4Eq.jpg"
     }
    },
    "Walking Lunge": {
     "bw": {
      "name": "Bodyweight Walking Lunge",
      "img": "./exercise-media/posters/IZVHb27.jpg",
      "img2": "./exercise-media/posters/IZVHb27.jpg"
     }
    }
   },
   "cues": {
    "Air Bike": "Slow controlled twists · opposite elbow to opposite knee.",
    "Archer Push-up": "Weight on one arm · other extended · unilateral load.",
    "Bear Crawl": "All fours · knees hover · crawl forward.",
    "Bodyweight Standing Calf Raise": "Push through balls of feet · squeeze top · lower controlled.",
    "Bodyweight Walking Lunge": "Long step · back knee light kiss · torso tall.",
    "Burpee": "Squat · plank · push-up · jump up · repeat.",
    "Clap Push-up": "Explode up · clap at top · land soft.",
    "Close-grip Push-up": "Hands narrow · elbows tuck · triceps focus.",
    "Cobra Upward Dog": "Press through hands · lift chest · open front.",
    "Curtsey Squat": "Cross back leg behind · squat unilateral.",
    "Decline Crunch": "Feet elevated · crunch up · slow down.",
    "Diamond Push-Up": "Hands in triangle under chest · elbows track back · squeeze triceps.",
    "Glute Bridge March": "Bridge held · slow knee lift · hips level.",
    "Handstand Push-Up": "Feet on wall · lower head to floor · press strong · no arch.",
    "Hindu Push-up": "Flow · pike → cobra → back to pike.",
    "Jack Jump": "Star jump variant · full extension.",
    "Kneeling Triceps Extension": "Kneel · hinge forward · triceps extend arms.",
    "L-Sit on Floor": "Sit · press hands down · lift legs 90° · hold.",
    "Lower Back Curl": "Prone · lift chest with lower back · squeeze.",
    "Lying Leg-Hip Raise": "Lift legs + hips off floor · control descent.",
    "Pistol Squat": "Single-leg squat · other leg forward · control descent.",
    "Plank": "Straight line head-to-heels · brace core · don't sag.",
    "Plank with Twist": "Forearm plank · rotate through side plank · hips high.",
    "Plyo Push-up": "Explosive · hands leave floor · soft landing.",
    "Pushups": "Hands under shoulders · elbows ~45° · lower chest to just above floor.",
    "Rear Deltoid Stretch": "Arm across body · pull elbow toward opposite shoulder · isometric.",
    "Reverse Crunch": "Lift hips · knees to chest · controlled lower.",
    "Russian Twist": "Sit tall · lean back · rotate side to side.",
    "Side Bridge": "Stack shoulders · hips high · straight line.",
    "Single Arm Push-up": "One arm behind back · wide base · slow eccentric.",
    "Single Leg Bridge": "One foot planted · other extended · bridge unilateral.",
    "Sissy Squat": "Lean back · knees forward · quads intense · balance.",
    "Sphinx": "Forearms down · lift chest · passive extension hold.",
    "Split Squats": "Feet split stance · back knee toward floor · vertical shin.",
    "Squat": "Push hips back · knees over toes · reach tall at top.",
    "Standing Archer": "Standing · one arm pulls · other extends · unilateral.",
    "Standing Single Leg Curl": "One leg planted · curl heel to glute · squeeze hamstring.",
    "Star Jump": "Explosive jump · arms + legs out.",
    "Superman": "Prone · lift arms + legs · squeeze low back.",
    "V-Sit on Floor": "Balance on sit bones · V-shape · hold."
   }
  },
 },
 "meals": {
  "principles": [
   "Aim for protein at every meal (~30–40 g). It's the biggest lever for building and keeping muscle.",
   "Base meals around whole foods — lean protein, vegetables, fruit, and whole grains.",
   "Eat within a couple of hours after training (protein + carbs) to support recovery.",
   "Adjust portions to your goal: eat a little more to gain, a little less to lose."
  ],
  "meals": [
   {
    "t": "🌅 Breakfast",
    "p": "~35 g protein",
    "ideas": [
     "3 eggs + 2 slices wholegrain toast + fruit — ~28 g",
     "Greek yogurt (200 g) + oats + honey + berries — ~25 g",
     "Egg-white omelette + whole egg + cheese — ~30 g"
    ]
   },
   {
    "t": "🥗 Lunch",
    "p": "~45 g protein",
    "ideas": [
     "Grilled chicken breast (180 g) + rice + salad — ~50 g",
     "Lentil or chickpea stew + tuna — ~35 g",
     "Salmon + potatoes + veg — ~40 g"
    ]
   },
   {
    "t": "🍎 Snack",
    "p": "~25 g protein",
    "ideas": [
     "Whey shake + banana — ~28 g",
     "Cottage cheese + nuts — ~20 g",
     "Tuna can + wholegrain crackers — ~25 g",
     "Boiled eggs (2) + fruit — ~13 g"
    ]
   },
   {
    "t": "🌙 Dinner",
    "p": "~40 g protein",
    "ideas": [
     "Lean beef or turkey + quinoa + veg — ~45 g",
     "White fish + sweet potato + greens — ~38 g",
     "Tofu or tempeh stir-fry + rice (plant option) — ~30 g",
     "Chicken + wholegrain pasta + tomato — ~42 g"
    ]
   }
  ],
  "protein_foods": [
   "Eggs & egg whites",
   "Chicken & turkey",
   "White fish & salmon",
   "Greek yogurt & cottage cheese",
   "Whey protein",
   "Tuna",
   "Lentils & chickpeas",
   "Tofu & tempeh",
   "Cheese"
  ]
 }
} as unknown as Catalog;
export default catalog;
