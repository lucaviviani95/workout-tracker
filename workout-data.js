// Exercise Library Database
const exerciseLibrary = {
    strength: [
        {
            id: 'bench-press',
            name: 'Bench Press',
            category: 'strength',
            muscle: 'Chest',
            equipment: 'Barbell',
            description: 'Lie on bench, lower barbell to chest, press up'
        },
        {
            id: 'squat',
            name: 'Squat',
            category: 'strength',
            muscle: 'Legs',
            equipment: 'Barbell',
            description: 'Barbell on shoulders, squat down, stand up'
        },
        {
            id: 'deadlift',
            name: 'Deadlift',
            category: 'strength',
            muscle: 'Back',
            equipment: 'Barbell',
            description: 'Lift barbell from ground to hip level'
        },
        {
            id: 'shoulder-press',
            name: 'Shoulder Press',
            category: 'strength',
            muscle: 'Shoulders',
            equipment: 'Dumbbells',
            description: 'Press weights overhead from shoulders'
        },
        {
            id: 'bicep-curl',
            name: 'Bicep Curl',
            category: 'strength',
            muscle: 'Arms',
            equipment: 'Dumbbells',
            description: 'Curl weights while keeping elbows stationary'
        },
        {
            id: 'tricep-extension',
            name: 'Tricep Extension',
            category: 'strength',
            muscle: 'Arms',
            equipment: 'Cable',
            description: 'Extend arms to work triceps'
        },
        {
            id: 'lat-pulldown',
            name: 'Lat Pulldown',
            category: 'strength',
            muscle: 'Back',
            equipment: 'Cable Machine',
            description: 'Pull bar down to chest while seated'
        },
        {
            id: 'leg-press',
            name: 'Leg Press',
            category: 'strength',
            muscle: 'Legs',
            equipment: 'Machine',
            description: 'Press weight with legs while seated'
        },
        {
            id: 'chest-fly',
            name: 'Chest Fly',
            category: 'strength',
            muscle: 'Chest',
            equipment: 'Dumbbells',
            description: 'Lie on bench, arms out to sides, bring together'
        },
        {
            id: 'pull-up',
            name: 'Pull Up',
            category: 'strength',
            muscle: 'Back',
            equipment: 'Bodyweight',
            description: 'Pull body up to bar'
        }
    ],
    cardio: [
        {
            id: 'running',
            name: 'Running',
            category: 'cardio',
            muscle: 'Full Body',
            equipment: 'None',
            description: 'Continuous running at steady pace'
        },
        {
            id: 'cycling',
            name: 'Cycling',
            category: 'cardio',
            muscle: 'Legs',
            equipment: 'Bike',
            description: 'Ride stationary or outdoor bike'
        },
        {
            id: 'rowing',
            name: 'Rowing',
            category: 'cardio',
            muscle: 'Full Body',
            equipment: 'Rowing Machine',
            description: 'Full body rowing motion'
        },
        {
            id: 'jump-rope',
            name: 'Jump Rope',
            category: 'cardio',
            muscle: 'Legs',
            equipment: 'Jump Rope',
            description: 'Continuous jumping over rope'
        },
        {
            id: 'elliptical',
            name: 'Elliptical',
            category: 'cardio',
            muscle: 'Full Body',
            equipment: 'Elliptical Machine',
            description: 'Low impact cardio exercise'
        }
    ],
    bodyweight: [
        {
            id: 'push-up',
            name: 'Push Up',
            category: 'bodyweight',
            muscle: 'Chest',
            equipment: 'Bodyweight',
            description: 'Push body up from ground'
        },
        {
            id: 'plank',
            name: 'Plank',
            category: 'bodyweight',
            muscle: 'Core',
            equipment: 'Bodyweight',
            description: 'Hold body in straight line on forearms'
        },
        {
            id: 'lunges',
            name: 'Lunges',
            category: 'bodyweight',
            muscle: 'Legs',
            equipment: 'Bodyweight',
            description: 'Step forward and bend both knees'
        },
        {
            id: 'sit-ups',
            name: 'Sit Ups',
            category: 'bodyweight',
            muscle: 'Core',
            equipment: 'Bodyweight',
            description: 'Lift torso from lying to sitting position'
        },
        {
            id: 'burpees',
            name: 'Burpees',
            category: 'bodyweight',
            muscle: 'Full Body',
            equipment: 'Bodyweight',
            description: 'Squat, kick back, push-up, jump up'
        },
        {
            id: 'mountain-climbers',
            name: 'Mountain Climbers',
            category: 'bodyweight',
            muscle: 'Core',
            equipment: 'Bodyweight',
            description: 'Alternate bringing knees to chest in plank'
        }
    ]
};

// Sample Workout Templates
const workoutTemplates = [
    {
        id: 'full-body-1',
        name: 'Full Body Workout',
        type: 'strength',
        exercises: [
            {
                id: 'squat',
                name: 'Squat',
                type: 'reps',
                sets: 3,
                targetReps: 10,
                targetWeight: 60
            },
            {
                id: 'bench-press',
                name: 'Bench Press',
                type: 'reps',
                sets: 3,
                targetReps: 10,
                targetWeight: 50
            },
            {
                id: 'pull-up',
                name: 'Pull Up',
                type: 'reps',
                sets: 3,
                targetReps: 8,
                targetWeight: 0
            },
            {
                id: 'shoulder-press',
                name: 'Shoulder Press',
                type: 'reps',
                sets: 3,
                targetReps: 10,
                targetWeight: 20
            }
        ],
        restTime: 60
    },
    {
        id: 'push-day',
        name: 'Push Day',
        type: 'strength',
        exercises: [
            {
                id: 'bench-press',
                name: 'Bench Press',
                type: 'reps',
                sets: 4,
                targetReps: 8,
                targetWeight: 70
            },
            {
                id: 'shoulder-press',
                name: 'Shoulder Press',
                type: 'reps',
                sets: 3,
                targetReps: 10,
                targetWeight: 25
            },
            {
                id: 'tricep-extension',
                name: 'Tricep Extension',
                type: 'reps',
                sets: 3,
                targetReps: 12,
                targetWeight: 15
            },
            {
                id: 'chest-fly',
                name: 'Chest Fly',
                type: 'reps',
                sets: 3,
                targetReps: 12,
                targetWeight: 15
            }
        ],
        restTime: 90
    },
    {
        id: 'cardio-session',
        name: 'Cardio Blast',
        type: 'cardio',
        exercises: [
            {
                id: 'running',
                name: 'Running',
                type: 'time',
                sets: 1,
                targetTime: 1800 // 30 minutes in seconds
            },
            {
                id: 'rowing',
                name: 'Rowing',
                type: 'distance',
                sets: 3,
                targetDistance: 500 // meters
            }
        ],
        restTime: 30
    },
    {
        id: 'hiit-workout',
        name: 'HIIT Circuit',
        type: 'hiit',
        exercises: [
            {
                id: 'burpees',
                name: 'Burpees',
                type: 'reps',
                sets: 4,
                targetReps: 15
            },
            {
                id: 'mountain-climbers',
                name: 'Mountain Climbers',
                type: 'time',
                sets: 4,
                targetTime: 45
            },
            {
                id: 'jump-rope',
                name: 'Jump Rope',
                type: 'time',
                sets: 4,
                targetTime: 60
            }
        ],
        restTime: 20
    }
];

// Get all exercises
function getAllExercises() {
    const allExercises = [];
    Object.values(exerciseLibrary).forEach(category => {
        allExercises.push(...category);
    });
    return allExercises;
}

// Get exercises by category
function getExercisesByCategory(category) {
    if (category === 'all') {
        return getAllExercises();
    }
    return exerciseLibrary[category] || [];
}

// Search exercises
function searchExercises(query) {
    const allExercises = getAllExercises();
    const searchTerm = query.toLowerCase();
    return allExercises.filter(exercise => 
        exercise.name.toLowerCase().includes(searchTerm) ||
        exercise.muscle.toLowerCase().includes(searchTerm) ||
        exercise.description.toLowerCase().includes(searchTerm)
    );
}

// Get exercise by ID
function getExerciseById(id) {
    const allExercises = getAllExercises();
    return allExercises.find(exercise => exercise.id === id);
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get workout template by ID
function getWorkoutTemplate(id) {
    return workoutTemplates.find(template => template.id === id);
}

// Get all workout templates
function getAllWorkoutTemplates() {
    return workoutTemplates;
}

// Create a new workout template
function createWorkoutTemplate(name, type, exercises, restTime) {
    const newTemplate = {
        id: generateId(),
        name,
        type,
        exercises,
        restTime,
        createdAt: new Date().toISOString()
    };
    
    // In a real app, you would save this to IndexedDB
    workoutTemplates.push(newTemplate);
    return newTemplate;
}

// Calculate workout statistics
function calculateWorkoutStats(workoutLog) {
    let totalSets = 0;
    let totalReps = 0;
    let totalWeight = 0;
    let totalDistance = 0;
    let totalTime = 0;
    
    workoutLog.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalSets++;
            if (exercise.type === 'reps' || exercise.type === 'weight') {
                totalReps += set.actualReps || set.targetReps;
                totalWeight += set.actualWeight || set.targetWeight || 0;
            } else if (exercise.type === 'distance') {
                totalDistance += set.actualDistance || set.targetDistance;
            } else if (exercise.type === 'time') {
                totalTime += set.actualTime || set.targetTime;
            }
        });
    });
    
    return {
        totalSets,
        totalReps,
        totalWeight,
        totalDistance,
        totalTime
    };
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate streak
function calculateStreak(workoutLogs) {
    if (!workoutLogs.length) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = today;
    
    // Sort logs by date (newest first)
    const sortedLogs = [...workoutLogs].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    // Check consecutive days
    for (let i = 0; i < sortedLogs.length; i++) {
        const logDate = new Date(sortedLogs[i].date);
        logDate.setHours(0, 0, 0, 0);
        
        const diffTime = currentDate - logDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            // Same day, continue
            continue;
        } else if (diffDays === 1) {
            // Consecutive day
            streak++;
            currentDate = logDate;
        } else {
            // Break in streak
            break;
        }
    }
    
    // If we have a workout today, add 1
    const hasWorkoutToday = sortedLogs.some(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });
    
    if (hasWorkoutToday) {
        streak++;
    }
    
    return streak;
}

export {
    getAllExercises,
    getExercisesByCategory,
    searchExercises,
    getExerciseById,
    generateId,
    getWorkoutTemplate,
    getAllWorkoutTemplates,
    createWorkoutTemplate,
    calculateWorkoutStats,
    formatTime,
    formatDate,
    calculateStreak
};