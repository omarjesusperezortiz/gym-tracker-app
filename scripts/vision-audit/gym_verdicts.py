# Gym audit verdicts, keyed by row n in gym-matrix.json (dump_gym_matrix.ts).
# Each: (verdict, failed checks, problem, candidate). Rows not listed are MATCH.
# Checks: 1=animation shows named exercise, 2=muscle, 3=equipment vs tab, 4=steps/cue text.
# Every candidate id below was viewed frame by frame (start/¼/½/¾).
REMOVE = "REMOVE tab"
V = {
 14: ("MISMATCH","1,4","Title says Standing; animation and steps are SEATED (EDB 'dumbbell bench seated press')","A6wtbuL dumbbell standing overhead press (or keep id, rename 'Seated Dumbbell Press')"),
 15: ("MISMATCH","1,2","Decline push-up is a chest press, not an overhead press",REMOVE+" (Handstand Push-up rQxwMxO already has its own slot — no duplicate)"),
 16: ("MISMATCH","3","Bodyweight pull-up filed under the Barbell tab (known mismatch)",REMOVE+" bar; offer 0V2YQjW Pullups under a Bodyweight tab instead (gym allows bodyweight)"),
 18: ("MISMATCH","1,2","Bent-over two-dumbbell ROW is a horizontal pull, filed under Vertical pull; duplicates the Horizontal row family",REMOVE+" (EDB has no dumbbell vertical pull)"),
 21: ("MISMATCH","1","Hammer (neutral-grip) rope curl under Biceps curl; same id is Hammer curl › cable (duplicate)","G08RZcQ cable curl"),
 24: ("UNCLEAR","1,2","Chin-up is a compound lat pull (biceps secondary); acceptable bodyweight biceps proxy; duplicated by Hammer curl › bw","keep"),
 28: ("MISMATCH","1,4","Overhead extension filed under Pushdown/ext; title says Standing but animation/steps are SEATED; duplicates Overhead triceps › db","W6PxUkg dumbbell kickback"),
 31: ("MISMATCH","1","Low-to-high cable FLY under an Incline PRESS slot (cue literally says 'flye')","Vh0GsK4 cable incline bench press"),
 35: ("UNCLEAR","4","Animation is a two-handle crossover lateral raise; steps describe a one-arm raise ('handle in the hand furthest away')","wEulIzp cable one arm lateral raise (matches the steps) — or rewrite steps"),
 37: ("MISMATCH","1,3","Band under Bodyweight (known); arm travels FORWARD (front raise), not lateral",REMOVE+" (no bodyweight lateral raise in EDB)"),
 38: ("MISMATCH","1,3,4","Plank-with-twist (bodyweight) under Dumbbell (known); title 'Plank' + cue 'hold' but the animation rotates into a side plank",REMOVE+" db; slot needs a bw static plank — none in EDB → free-exercise-db 'Plank' photo ⚠ last resort"),
 39: ("MISMATCH","1,4","Calisthenics title 'Plank' (hold) but animation is plank-with-twist","same fix as Plank › Bodyweight"),
 43: ("MISMATCH","3","Band pull-apart under Bodyweight (known); movement itself is right",REMOVE+" (no bodyweight rear-delt exercise in EDB)"),
 48: ("MISMATCH","1,2","Calisthenics title 'Superman' but animation is Upward Facing Dog (spine) — under Shrugs","7xeukSt scapula dips (bodyweight traps; uses a bench — calisthenics only) or "+REMOVE),
 50: ("MISMATCH","1","Underhand preacher curl under Hammer curl; duplicates Biceps curl › machine","OAguZoG lever hammer grip preacher curl"),
 52: ("MISMATCH","1","Chin-up is not a hammer curl; duplicates Biceps curl › bw",REMOVE),
 56: ("UNCLEAR","1","Chip 'Squat' is EDB 'squat to overhead reach' (ends standing, arms up); EDB has no plain bodyweight squat","keep (no better EDB option)"),
 60: ("MISMATCH","1","Sissy Squat animation holds an incline bench — this bw tab is shared with TRAVEL (no benches)","remove chip from the travel Squat (keep for calisthenics only)"),
 61: ("MISMATCH","3","Hanging leg raise (bodyweight, pull-up bar) under Barbell (known)",REMOVE+" bar; move I3tsCnC to a Bodyweight tab"),
 62: ("MISMATCH","1,4","Seated cable CRUNCH under a Leg raise slot; cue says 'Kneel' but animation is seated; duplicates Hanging/Lying › cable","RqOtqD7 cable reverse crunch (legs pull against low cable)"),
 63: ("MISMATCH","1,3","Weight-plate crunch ('weighted') under Dumbbell (known); a crunch, not a leg raise",REMOVE+" (no dumbbell leg raise in EDB)"),
 66: ("MISMATCH","1,2,3,4","'Butterfly' is the floor butterfly YOGA STRETCH (adductors, bodyweight) under Machine; cue describes a pec deck (known)","v3xmPAR lever seated fly (pec deck)"),
 67: ("UNCLEAR","1","Incline TWISTED flyes behind a generic 'Dumbbell Flyes' title (steps do say incline)","yz9nUhF dumbbell fly (flat) if a flat fly is intended"),
 68: ("MISMATCH","1","Push-up is a press, not a fly",REMOVE+" (no bodyweight fly in EDB)"),
 70: ("MISMATCH","1,2","Bench Dips (triceps) filed under Chest dip › bw; unreachable (not default, no chip) — dead data","remove id from Chest dip (it's correctly used under Triceps pushdown/ext › bw)"),
 74: ("MISMATCH","1,2","Calisthenics title 'Superman', animation Upward Facing Dog — not a lat pullover",REMOVE),
 75: ("MISMATCH","1,4","Title 'Front Plate Raise' but animation and steps are a BARBELL front raise","keep b2Uoz54, rename 'Barbell Front Raise'"),
 78: ("MISMATCH","1,2","Decline push-up is not a front raise",REMOVE),
 81: ("MISMATCH","3","Smith machine under Machine tab (known); movement correct",REMOVE+" (EDB has no lever/selectorized upright row) — or count Smith as Machine"),
 83: ("MISMATCH","1,2,3","Band pull-apart (rear delts, band) under Upright row › bw (known)",REMOVE),
 85: ("MISMATCH","1","Machine triceps extension is not overhead; duplicates Triceps pushdown/ext › machine",REMOVE+" (no overhead triceps machine in EDB)"),
 86: ("MISMATCH","1,4","Title says Standing; animation and steps are SEATED (EDB 'dumbbell seated triceps extension')","PdmaD0N dumbbell standing triceps extension"),
 87: ("MISMATCH","1","Bench dip is not an overhead extension; duplicates Triceps pushdown/ext › bw",REMOVE+" (Kneeling Triceps Ext s0HKO2I has its own slot)"),
 88: ("UNCLEAR","4","Animation kneels behind a bench, forearms on the bench; steps say 'sit on a bench, forearms on thighs'","keep id, rewrite steps"),
 90: ("MISMATCH","1,2","Calisthenics title 'Plank' under Forearm / wrist; animation plank-with-twist",REMOVE),
 92: ("MISMATCH","1","Bilateral leg press under Lunge; duplicates Squat › machine","9KU9TYF lever horizontal one leg press"),
 99: ("MISMATCH","1,3,4","DUMBBELL RDL under Barbell (known); cue says 'bar down shins'","wQ2c4XD barbell romanian deadlift (already in exercises.ts)"),
 102: ("UNCLEAR","1,2","'Butt Lift (Bridge)' is EDB glute bridge MARCH — glute-dominant, alternates legs — under Hamstring / RDL",REMOVE+" (bodyweight hamstring curls C5jncD2/ZSY3MsL already belong to the Standing Single Leg Curl slot)"),
 104: ("UNCLEAR","1","Title 'Standing Calf Raises' but animation is a RECLINED hack-sled calf press","ykUOVze lever standing calf raise"),
 107: ("MISMATCH","1,4","EDB 'power point plank' (alternating arm/leg reaches) behind title 'Plank' and cue 'hold, don't let hips sag'","no static bodyweight plank in EDB → free-exercise-db 'Plank' photo ⚠ last resort, or rename chip 'Power Point Plank'"),
 109: ("MISMATCH","3","Hanging leg raise under Barbell (known)",REMOVE+" bar; add I3tsCnC as a Bodyweight chip next to WhuFnR7"),
 110: ("MISMATCH","1,4","Seated cable crunch under a Leg raise slot; cue 'Kneel' vs seated; duplicates Leg raise (core) › cable","TXtXc84 cable tuck reverse crunch"),
 116: ("MISMATCH","3","Bodyweight Russian twist under Dumbbell (known); same id as the Bodyweight default",REMOVE+" (EDB loaded twists are plate/medicine-ball, not dumbbell)"),
 118: ("UNCLEAR","1,2","Bent Knee Lying Twist is a supine mobility twist (target glutes), not a Russian-twist variant","remove chip"),
 119: ("UNCLEAR","1","Plank with Twist chip — same id is also the Plank chip, Plank (core) › db and Pallof › bw (duplicate)","remove chip"),
 125: ("MISMATCH","3","BAND Pallof press under Cable (known)",REMOVE+" (EDB only has band Pallof presses) — or add a Band tab kind"),
 126: ("MISMATCH","1,2,4","Title 'Plank' + cue 'hold'; animation plank-with-twist — not an anti-rotation press",REMOVE),
 128: ("UNCLEAR","1,2","Reverse Plank with Leg Lift is a posterior-chain bridge, not a reverse crunch","remove chip"),
}
NOTES = {
 3:"EDB 'machine inner chest press'", 51:"Arm-blaster variant", 64:"Uses a bench (calisthenics only)", 73:"Bent-arm pullover",
 106:"Uses a bench + step (calisthenics only)", 111:"Uses a bench", 113:"Plain crunch chip under Bicycle Crunch (honest chip label)",
 115:"Knee-touch crunch chip", 29:"Correct bench dip", 34:"Decline push-up biases upper chest", 53:"Quads highlighted (EDB convention)",
 55:"Side view, dumbbells at sides", 91:"Quads highlighted (EDB convention)", 62:"", 
}

# Export code per non-MATCH row: what "Approve fix" means, in the form pasted
# back to chat. An EDB id = swap to that exercise; MOVE-TO-BW:<id> = drop this
# tab and offer <id> under Bodyweight; FED:<name> = free-exercise-db photo.
ACTION = {
 14: "A6wtbuL", 15: "REMOVE-TAB", 16: "MOVE-TO-BW:0V2YQjW", 18: "REMOVE-TAB", 21: "G08RZcQ",
 24: "KEEP", 28: "W6PxUkg", 31: "Vh0GsK4", 35: "wEulIzp", 37: "REMOVE-TAB",
 38: "REMOVE-TAB+FED:Plank", 39: "FED:Plank", 43: "REMOVE-TAB", 48: "7xeukSt", 50: "OAguZoG",
 52: "REMOVE-TAB", 56: "KEEP", 60: "REMOVE-CHIP(travel)", 61: "MOVE-TO-BW:I3tsCnC", 62: "RqOtqD7",
 63: "REMOVE-TAB", 66: "v3xmPAR", 67: "yz9nUhF", 68: "REMOVE-TAB", 70: "REMOVE-ID",
 74: "REMOVE-TAB", 75: "RENAME:Barbell Front Raise", 78: "REMOVE-TAB", 81: "REMOVE-TAB", 83: "REMOVE-TAB",
 85: "REMOVE-TAB", 86: "PdmaD0N", 87: "REMOVE-TAB", 88: "REWRITE-STEPS", 90: "REMOVE-TAB",
 92: "9KU9TYF", 99: "wQ2c4XD", 102: "REMOVE-TAB", 104: "ykUOVze", 107: "FED:Plank",
 109: "MOVE-TO-BW:I3tsCnC", 110: "TXtXc84", 116: "REMOVE-TAB", 118: "REMOVE-CHIP", 119: "REMOVE-CHIP",
 125: "REMOVE-TAB", 126: "REMOVE-TAB", 128: "REMOVE-CHIP",
}
FED = {"Plank": ["https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/0.jpg",
                 "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Plank/1.jpg"]}
