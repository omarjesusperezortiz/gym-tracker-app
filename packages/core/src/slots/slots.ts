// Slot → which exercises can fill it under each equipment kind. Ids point into
// ../exercises/exercises.ts; the comment after each id is that exercise's name.
// defaultVariant[kind] is what the card shows when no style chip is chosen;
// a plan may pin a different default (Plan.slotDefaults).

import type { Slot } from './types';

export const slots: Record<string, Slot> = {
  "Flat chest press": {
    key: "Flat chest press",
    variants: {
      bar: [
        "EIeI8Vf", // Barbell Bench Press - Medium Grip
      ],
      cable: [
        "nIR4Rwl", // Cable Chest Press
      ],
      machine: [
        "wDN97Ca", // Machine Bench Press
      ],
      db: [
        "SpYC0Kp", // Dumbbell Bench Press
      ],
      bw: [
        "I4hDWkc", // Pushups
      ],
    },
    defaultVariant: { bar: "EIeI8Vf", cable: "nIR4Rwl", machine: "wDN97Ca", db: "SpYC0Kp", bw: "I4hDWkc" },
  },
  "Horizontal row": {
    key: "Horizontal row",
    variants: {
      bar: [
        "eZyBC3j", // Bent Over Barbell Row
      ],
      cable: [
        "fUBheHs", // Seated Cable Rows
      ],
      machine: [
        "nZZZy9m", // Leverage High Row
      ],
      db: [
        "C0MA9bC", // One-Arm Dumbbell Row
      ],
      bw: [
        "bZGHsAZ", // Inverted Row
      ],
    },
    defaultVariant: { bar: "eZyBC3j", cable: "fUBheHs", machine: "nZZZy9m", db: "C0MA9bC", bw: "bZGHsAZ" },
  },
  "Overhead press": {
    key: "Overhead press",
    variants: {
      bar: [
        "wdRZISl", // Standing Military Press
      ],
      cable: [
        "PzQanLE", // Cable Shoulder Press
      ],
      machine: [
        "dNFYIU1", // Machine Shoulder (Military) Press
      ],
      db: [
        "A6wtbuL", // Dumbbell Standing Overhead Press
      ],
      bw: [
        "rQxwMxO", // Handstand Push-Up
      ],
    },
    defaultVariant: { bar: "wdRZISl", cable: "PzQanLE", machine: "dNFYIU1", db: "A6wtbuL", bw: "rQxwMxO" },
  },
  "Vertical pull (lats)": {
    key: "Vertical pull (lats)",
    variants: {
      bar: [
        "0V2YQjW", // Pullups
      ],
      cable: [
        "qdRxqCj", // Wide-Grip Lat Pulldown
      ],
      bw: [
        "0V2YQjW", // Pullups
      ],
    },
    defaultVariant: { bar: "0V2YQjW", cable: "qdRxqCj", bw: "0V2YQjW" },
  },
  "Biceps curl": {
    key: "Biceps curl",
    variants: {
      bar: [
        "25GPyDY", // Barbell Curl
      ],
      cable: [
        "G08RZcQ", // Cable Curl
      ],
      machine: [
        "b6hQYMb", // Machine Bicep Curl
      ],
      db: [
        "xiA6lRr", // Dumbbell Bicep Curl
      ],
      bw: [
        "sJFIDIp", // Biceps Leg Concentration Curl
      ],
    },
    defaultVariant: { bar: "25GPyDY", cable: "G08RZcQ", machine: "b6hQYMb", db: "xiA6lRr", bw: "sJFIDIp" },
  },
  "Triceps pushdown/ext": {
    key: "Triceps pushdown/ext",
    variants: {
      bar: [
        "iZop9xO", // Lying Triceps Press
      ],
      cable: [
        "gAwDzB3", // Triceps Pushdown
      ],
      machine: [
        "Ser9eQp", // Machine Triceps Extension
      ],
      db: [
        "kont8Ut", // Standing Dumbbell Triceps Extension
      ],
      bw: [
        "RrLske5", // Bench Dips
      ],
    },
    defaultVariant: { bar: "iZop9xO", cable: "gAwDzB3", machine: "Ser9eQp", db: "kont8Ut", bw: "RrLske5" },
  },
  "Incline press": {
    key: "Incline press",
    variants: {
      bar: [
        "3TZduzM", // Barbell Incline Bench Press - Medium Grip
      ],
      cable: [
        "Vh0GsK4", // Cable Incline Bench Press
      ],
      machine: [
        "jHAnWmT", // Leverage Incline Chest Press
      ],
      db: [
        "ns0SIbU", // Incline Dumbbell Press
      ],
      bw: [
        "i5cEhka", // Decline Push-Up
      ],
    },
    defaultVariant: { bar: "3TZduzM", cable: "Vh0GsK4", machine: "jHAnWmT", db: "ns0SIbU", bw: "i5cEhka" },
  },
  "Side lateral raise": {
    key: "Side lateral raise",
    variants: {
      cable: [
        "wEulIzp", // Cable One-Arm Lateral Raise
      ],
      db: [
        "DsgkuIt", // Side Lateral Raise
      ],
    },
    defaultVariant: { cable: "wEulIzp", db: "DsgkuIt" },
  },
  "Plank (core)": {
    key: "Plank (core)",
    variants: {
      db: [
        "CosupLu", // Plank with Twist
      ],
      bw: [
        "CosupLu", // Plank with Twist
      ],
    },
    defaultVariant: { db: "CosupLu", bw: "CosupLu" },
  },
  "Rear delts": {
    key: "Rear delts",
    variants: {
      cable: [
        "wqNPGCg", // Face Pull
      ],
      machine: [
        "myfUsKf", // Reverse Machine Flyes
      ],
      db: [
        "8DiFDVA", // Seated Bent-Over Rear Delt Raise
      ],
    },
    defaultVariant: { cable: "wqNPGCg", machine: "myfUsKf", db: "8DiFDVA" },
  },
  "Shrugs (traps)": {
    key: "Shrugs (traps)",
    variants: {
      bar: [
        "dG7tG5y", // Barbell Shrug
      ],
      cable: [
        "Eg98Ft9", // Cable Shrugs
      ],
      machine: [
        "ZZKbeMw", // Leverage Shrug
      ],
      db: [
        "NJzBsGJ", // Dumbbell Shrug
      ],
      bw: [
        "7xeukSt", // Scapula Dips
      ],
    },
    defaultVariant: { bar: "dG7tG5y", cable: "Eg98Ft9", machine: "ZZKbeMw", db: "NJzBsGJ", bw: "7xeukSt" },
  },
  "Hammer curl": {
    key: "Hammer curl",
    variants: {
      cable: [
        "HPlPoQA", // Cable Hammer Curls - Rope Attachment
      ],
      machine: [
        "OAguZoG", // Machine Hammer Curl
      ],
      db: [
        "GNhAeJ0", // Hammer Curls
      ],
    },
    defaultVariant: { cable: "HPlPoQA", machine: "OAguZoG", db: "GNhAeJ0" },
  },
  "Squat": {
    key: "Squat",
    variants: {
      bar: [
        "qXTaZnJ", // Barbell Full Squat
      ],
      machine: [
        "10Z2DXU", // Leg Press
      ],
      db: [
        "HsvHqgf", // Dumbbell Squat
      ],
      bw: [
        "75Bgtjy", // Bodyweight Squat
        "QChZi3x", // Squat to Overhead Reach
        "LIlE5Tn", // Jump Squat
      ],
    },
    defaultVariant: { bar: "qXTaZnJ", machine: "10Z2DXU", db: "HsvHqgf", bw: "75Bgtjy" },
  },
  "Leg raise (core)": {
    key: "Leg raise (core)",
    variants: {
      bar: [
        "I3tsCnC", // Hanging Leg Raise
      ],
      cable: [
        "8xUv4J7", // Cable Crunch
      ],
      bw: [
        "WhuFnR7", // Flat Bench Lying Leg Raise
      ],
    },
    defaultVariant: { bar: "I3tsCnC", cable: "8xUv4J7", bw: "WhuFnR7" },
  },
  "Chest fly": {
    key: "Chest fly",
    variants: {
      cable: [
        "xLYSdtg", // Cable Crossover
      ],
      machine: [
        "v3xmPAR", // Pec Deck Fly
      ],
      db: [
        "yz9nUhF", // Flat Dumbbell Fly
      ],
    },
    defaultVariant: { cable: "xLYSdtg", machine: "v3xmPAR", db: "yz9nUhF" },
  },
  "Chest dip": {
    key: "Chest dip",
    variants: {
      bw: [
        "9WTm7dq", // Dips - Chest Version
        "RrLske5", // Bench Dips
      ],
      machine: [
        "PAgTVaK", // Dip Machine
      ],
    },
    defaultVariant: { bw: "9WTm7dq", machine: "PAgTVaK" },
  },
  "Lat pullover / straight-arm": {
    key: "Lat pullover / straight-arm",
    variants: {
      cable: [
        "x69MAlq", // Straight-Arm Pulldown
      ],
      db: [
        "9XjtHvS", // Bent-Arm Dumbbell Pullover
      ],
    },
    defaultVariant: { cable: "x69MAlq", db: "9XjtHvS" },
  },
  "Front raise": {
    key: "Front raise",
    variants: {
      bar: [
        "b2Uoz54", // Front Plate Raise
      ],
      cable: [
        "u2X71Np", // Front Cable Raise
      ],
      db: [
        "3eGE2JC", // Front Dumbbell Raise
      ],
    },
    defaultVariant: { bar: "b2Uoz54", cable: "u2X71Np", db: "3eGE2JC" },
  },
  "Upright row": {
    key: "Upright row",
    variants: {
      bar: [
        "UDlhcO8", // Upright Barbell Row
      ],
      cable: [
        "cALKspW", // Upright Cable Row
      ],
      machine: [
        "1DN3iz4", // Smith Machine Upright Row
      ],
      db: [
        "ainizkb", // Standing Dumbbell Upright Row
      ],
    },
    defaultVariant: { bar: "UDlhcO8", cable: "cALKspW", machine: "1DN3iz4", db: "ainizkb" },
  },
  "Overhead triceps": {
    key: "Overhead triceps",
    variants: {
      cable: [
        "2IxROQ1", // Cable Rope Overhead Triceps Extension
      ],
      db: [
        "PdmaD0N", // Dumbbell Standing Triceps Extension
      ],
      bw: [
        "s0HKO2I", // Kneeling Triceps Extension
      ],
    },
    defaultVariant: { cable: "2IxROQ1", db: "PdmaD0N", bw: "s0HKO2I" },
  },
  "Forearm / wrist": {
    key: "Forearm / wrist",
    variants: {
      bar: [
        "82LxxkW", // Palms-Up Barbell Wrist Curl Over A Bench
      ],
      db: [
        "BLCvwr2", // Palms-Down Dumbbell Wrist Curl Over A Bench
      ],
      bw: [
        "2zNKRUB", // Wrist Circles
      ],
    },
    defaultVariant: { bar: "82LxxkW", db: "BLCvwr2", bw: "2zNKRUB" },
  },
  "Lunge": {
    key: "Lunge",
    variants: {
      bar: [
        "t8iSghb", // Barbell Lunge
      ],
      machine: [
        "10Z2DXU", // Leg Press
      ],
      db: [
        "RRWFUcw", // Dumbbell Lunges
      ],
      bw: [
        "kMzUs9Y", // Forward Lunge
        "K9VL0Jq", // Lunge with Twist
        "PM1PZjg", // Lunge with Jump
      ],
    },
    defaultVariant: { bar: "t8iSghb", machine: "10Z2DXU", db: "RRWFUcw", bw: "kMzUs9Y" },
  },
  "Hamstring / RDL": {
    key: "Hamstring / RDL",
    variants: {
      bar: [
        "wQ2c4XD", // Barbell Romanian Deadlift
      ],
      machine: [
        "17lJ1kr", // Lying Leg Curls
      ],
      db: [
        "5eLRITT", // Stiff-Legged Dumbbell Deadlift
      ],
      bw: [
        "zkgRrbK", // Hyperextension (on Bench)
      ],
    },
    defaultVariant: { bar: "wQ2c4XD", machine: "17lJ1kr", db: "5eLRITT", bw: "zkgRrbK" },
  },
  "Calf raise": {
    key: "Calf raise",
    variants: {
      bar: [
        "8ozhUIZ", // Standing Barbell Calf Raise
      ],
      machine: [
        "2ORFMoR", // Standing Calf Raises
      ],
      db: [
        "dPmaUaU", // Standing Dumbbell Calf Raise
      ],
      bw: [
        "u5ESqzH", // Donkey Calf Raises
      ],
    },
    defaultVariant: { bar: "8ozhUIZ", machine: "2ORFMoR", db: "dPmaUaU", bw: "u5ESqzH" },
  },
  "Plank": {
    key: "Plank",
    variants: {
      bw: [
        "hCjGsRQ", // Plank
        "CosupLu", // Plank with Twist
      ],
    },
    defaultVariant: { bw: "hCjGsRQ" },
  },
  "Hanging/Lying Leg Raise": {
    key: "Hanging/Lying Leg Raise",
    variants: {
      bar: [
        "I3tsCnC", // Hanging Leg Raise
      ],
      cable: [
        "8xUv4J7", // Cable Crunch
      ],
      bw: [
        "WhuFnR7", // Flat Bench Lying Leg Raise
      ],
    },
    defaultVariant: { bar: "I3tsCnC", cable: "8xUv4J7", bw: "WhuFnR7" },
  },
  "Bicycle Crunch": {
    key: "Bicycle Crunch",
    variants: {
      bw: [
        "1ZFqTDN", // Air Bike
        "rbu5UUb", // Cross Body Crunch
      ],
    },
    defaultVariant: { bw: "1ZFqTDN" },
  },
  "Russian Twist": {
    key: "Russian Twist",
    variants: {
      db: [
        "XVDdcoj", // Russian Twist
      ],
      bw: [
        "XVDdcoj", // Russian Twist
      ],
    },
    defaultVariant: { db: "XVDdcoj", bw: "XVDdcoj" },
  },
  "Side Plank": {
    key: "Side Plank",
    variants: {
      bw: [
        "RKjH6Lt", // Side Bridge
        "5VXmnV5", // Incline Side Plank
        "WL4EmxJ", // Side Bridge Hip Abduction
        "VO2qeJg", // Side Plank Hip Adduction
      ],
    },
    defaultVariant: { bw: "RKjH6Lt" },
  },
  "Pallof Press (anti-rotation)": {
    key: "Pallof Press (anti-rotation)",
    variants: {
      cable: [
        "9pa4H5m", // Pallof Press
      ],
    },
    defaultVariant: { cable: "9pa4H5m" },
  },
  "Dead Bug": {
    key: "Dead Bug",
    variants: {
      bw: [
        "iny3m5y", // Dead Bug
      ],
    },
    defaultVariant: { bw: "iny3m5y" },
  },
  "Reverse Crunch": {
    key: "Reverse Crunch",
    variants: {
      bw: [
        "nCU1Ekp", // Reverse Crunch
      ],
    },
    defaultVariant: { bw: "nCU1Ekp" },
  },
  "Archer Push-up": {
    key: "Archer Push-up",
    variants: {
      bw: [
        "A9qxk2F", // Archer Push-up
      ],
    },
    defaultVariant: { bw: "A9qxk2F" },
  },
  "Bear Crawl": {
    key: "Bear Crawl",
    variants: {
      bw: [
        "0Yz8WdV", // Bear Crawl
      ],
    },
    defaultVariant: { bw: "0Yz8WdV" },
  },
  "Burpee": {
    key: "Burpee",
    variants: {
      bw: [
        "dK9394r", // Burpee
        "mr7pkqP", // Jack Burpee
      ],
    },
    defaultVariant: { bw: "dK9394r" },
  },
  "Clap Push-up": {
    key: "Clap Push-up",
    variants: {
      bw: [
        "wigSg76", // Clap Push-up
      ],
    },
    defaultVariant: { bw: "wigSg76" },
  },
  "Close-grip Push-up": {
    key: "Close-grip Push-up",
    variants: {
      bw: [
        "x6KpKpq", // Close-grip Push-up
      ],
    },
    defaultVariant: { bw: "x6KpKpq" },
  },
  "Cobra (Upward Dog)": {
    key: "Cobra (Upward Dog)",
    variants: {
      bw: [
        "01qpYSe", // Upward Facing Dog
      ],
    },
    defaultVariant: { bw: "01qpYSe" },
  },
  "Curtsey Squat": {
    key: "Curtsey Squat",
    variants: {
      bw: [
        "gUjqdei", // Curtsey Squat
      ],
    },
    defaultVariant: { bw: "gUjqdei" },
  },
  "Decline Crunch": {
    key: "Decline Crunch",
    variants: {
      bw: [
        "9Ap7miY", // Decline Crunch
      ],
    },
    defaultVariant: { bw: "9Ap7miY" },
  },
  "Diamond Push-up": {
    key: "Diamond Push-up",
    variants: {
      bw: [
        "soIB2rj", // Diamond Push-Up
      ],
    },
    defaultVariant: { bw: "soIB2rj" },
  },
  "Glute Bridge": {
    key: "Glute Bridge",
    variants: {
      bw: [
        "u0cNiij", // Low Glute Bridge
        "GibBPPg", // Glute Bridge March
        "D9qe7CM", // Pelvic Tilt into Bridge
      ],
    },
    defaultVariant: { bw: "u0cNiij" },
  },
  "Handstand Push-up": {
    key: "Handstand Push-up",
    variants: {
      bw: [
        "rQxwMxO", // Handstand Push-Up
      ],
    },
    defaultVariant: { bw: "rQxwMxO" },
  },
  "Hindu Push-up": {
    key: "Hindu Push-up",
    variants: {
      bw: [
        "epOSYUZ", // Hindu Push-up
      ],
    },
    defaultVariant: { bw: "epOSYUZ" },
  },
  "Jack Jump": {
    key: "Jack Jump",
    variants: {
      bw: [
        "1g5bPpA", // Jack Jump
      ],
    },
    defaultVariant: { bw: "1g5bPpA" },
  },
  "Kneeling Triceps Ext": {
    key: "Kneeling Triceps Ext",
    variants: {
      bw: [
        "s0HKO2I", // Kneeling Triceps Extension
      ],
    },
    defaultVariant: { bw: "s0HKO2I" },
  },
  "L-Sit Hold": {
    key: "L-Sit Hold",
    variants: {
      bw: [
        "UpWmA5E", // L-Sit on Floor
      ],
    },
    defaultVariant: { bw: "UpWmA5E" },
  },
  "Lower Back Curl": {
    key: "Lower Back Curl",
    variants: {
      bw: [
        "ANbbry2", // Lower Back Curl
      ],
    },
    defaultVariant: { bw: "ANbbry2" },
  },
  "Lying Leg-Hip Raise": {
    key: "Lying Leg-Hip Raise",
    variants: {
      bw: [
        "9IxJdtC", // Lying Leg-Hip Raise
      ],
    },
    defaultVariant: { bw: "9IxJdtC" },
  },
  "Pistol Squat": {
    key: "Pistol Squat",
    variants: {
      bw: [
        "nqs5HGV", // Pistol Squat
      ],
    },
    defaultVariant: { bw: "nqs5HGV" },
  },
  "Plank (postural)": {
    key: "Plank (postural)",
    variants: {
      bw: [
        "CosupLu", // Plank with Twist
      ],
    },
    defaultVariant: { bw: "CosupLu" },
  },
  "Plank with Twist": {
    key: "Plank with Twist",
    variants: {
      bw: [
        "CosupLu", // Plank with Twist
      ],
    },
    defaultVariant: { bw: "CosupLu" },
  },
  "Plyo Push-up": {
    key: "Plyo Push-up",
    variants: {
      bw: [
        "Snj1wSv", // Plyo Push-up
      ],
    },
    defaultVariant: { bw: "Snj1wSv" },
  },
  "Push-up": {
    key: "Push-up",
    variants: {
      bw: [
        "I4hDWkc", // Pushups
        "ZOuKWir", // Kneeling Push-up
        "B1EVP9F", // Incline Push-up
        "JmMVpR3", // Wide Hand Push-up
        "qEse6fe", // Shoulder Tap Push-up
      ],
    },
    defaultVariant: { bw: "I4hDWkc" },
  },
  "Rear Delt Stretch": {
    key: "Rear Delt Stretch",
    variants: {
      bw: [
        "xifhB5W", // Rear Deltoid Stretch
      ],
    },
    defaultVariant: { bw: "xifhB5W" },
  },
  "Single Arm Push-up": {
    key: "Single Arm Push-up",
    variants: {
      bw: [
        "MUic5zN", // Single Arm Push-up
      ],
    },
    defaultVariant: { bw: "MUic5zN" },
  },
  "Single Leg Bridge": {
    key: "Single Leg Bridge",
    variants: {
      bw: [
        "rmEukuS", // Single Leg Bridge
      ],
    },
    defaultVariant: { bw: "rmEukuS" },
  },
  "Sissy Squat": {
    key: "Sissy Squat",
    variants: {
      bw: [
        "xdYPUtE", // Sissy Squat
      ],
    },
    defaultVariant: { bw: "xdYPUtE" },
  },
  "Sphinx": {
    key: "Sphinx",
    variants: {
      bw: [
        "DIVyqrU", // Sphinx
      ],
    },
    defaultVariant: { bw: "DIVyqrU" },
  },
  "Split Squats": {
    key: "Split Squats",
    variants: {
      bw: [
        "9E25EOx", // Split Squats
      ],
    },
    defaultVariant: { bw: "9E25EOx" },
  },
  "Standing Archer": {
    key: "Standing Archer",
    variants: {
      bw: [
        "JF8AkMX", // Standing Archer
      ],
    },
    defaultVariant: { bw: "JF8AkMX" },
  },
  "Standing Calf Raise": {
    key: "Standing Calf Raise",
    variants: {
      bw: [
        "bJYHBIN", // Bodyweight Standing Calf Raise
        "0jp9Rlz", // One Leg Floor Calf Raise
        "A2upspL", // One Leg Donkey Calf Raise
      ],
    },
    defaultVariant: { bw: "bJYHBIN" },
  },
  "Standing Single Leg Curl": {
    key: "Standing Single Leg Curl",
    variants: {
      bw: [
        "C5jncD2", // Standing Single Leg Curl
        "ZSY3MsL", // Self Assisted Inverse Leg Curl (Floor)
      ],
    },
    defaultVariant: { bw: "C5jncD2" },
  },
  "Star Jump": {
    key: "Star Jump",
    variants: {
      bw: [
        "HtfCpfi", // Star Jump
      ],
    },
    defaultVariant: { bw: "HtfCpfi" },
  },
  "Superman": {
    key: "Superman",
    variants: {
      bw: [
        "ANbbry2", // Lower Back Curl
      ],
    },
    defaultVariant: { bw: "ANbbry2" },
  },
  "V-Sit Hold": {
    key: "V-Sit Hold",
    variants: {
      bw: [
        "ZuXu4Eq", // V-Sit on Floor
      ],
    },
    defaultVariant: { bw: "ZuXu4Eq" },
  },
  "Walking Lunge": {
    key: "Walking Lunge",
    variants: {
      bw: [
        "IZVHb27", // Bodyweight Walking Lunge
        "J9zIWig", // Walking High Knees Lunge
      ],
    },
    defaultVariant: { bw: "IZVHb27" },
  },
};
