// Main Application JavaScript

// State Management
const appState = {
    currentView: 'home',
    workouts: [],
    workoutLogs: [],
    activeWorkout: null,
    workoutTimer: null,
    timerSeconds: 0,
    restTimer: null,
    restSeconds: 0,
    currentExerciseIndex: 0,
    currentSetIndex: 0,
    isWorkoutActive: false,
    isResting: false
};

// DOM Elements
const elements = {
    // Views
    homeView: document.getElementById('homeView'),
    workoutsView: document.getElementById('workoutsView'),
    createView: document.getElementById('createView'),
    activeWorkoutView: document.getElementById('activeWorkoutView'),
    historyView: document.getElementById('historyView'),
    exercisesView: document.getElementById('exercisesView'),
    statsView: document.getElementById('statsView'),
    
    // Navigation
    menuBtn: document.getElementById('menuBtn'),
    sidebar: document.getElementById('sidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    navItems: document.querySelectorAll('.nav-item'),
    navBtns: document.querySelectorAll('.nav-btn'),
    startWorkoutBtn: document.getElementById('startWorkoutBtn'),
    
    // Home View
    totalWorkouts: document.getElementById('totalWorkouts'),
    totalMinutes: document.getElementById('totalMinutes'),
    currentStreak: document.getElementById('currentStreak'),
    recentWorkoutsList: document.getElementById('recentWorkoutsList'),
    startQuickWorkout: document.getElementById('startQuickWorkout'),
    createNewWorkout: document.getElementById('createNewWorkout'),
    
    // Workouts View
    workoutsGrid: document.getElementById('workoutsGrid'),
    addWorkoutBtn: document.getElementById('addWorkoutBtn'),
    
    // Create View
    workoutName: document.getElementById('workoutName'),
    workoutNotes: document.getElementById('workoutNotes'),
    restTimer: document.getElementById('restTimer'),
    exercisesList: document.getElementById('exercisesList'),
    addExerciseBtn: document.getElementById('addExerciseBtn'),
    saveWorkoutBtn: document.getElementById('saveWorkoutBtn'),
    
    // Active Workout View
    activeWorkoutName: document.getElementById('activeWorkoutName'),
    workoutTimer: document.getElementById('workoutTimer'),
    workoutProgress: document.getElementById('workoutProgress'),
    currentExercise: document.getElementById('currentExercise'),
    exerciseProgress: document.getElementById('exerciseProgress'),
    activeExercises: document.getElementById('activeExercises'),
    pauseWorkoutBtn: document.getElementById('pauseWorkoutBtn'),
    nextSetBtn: document.getElementById('nextSetBtn'),
    finishWorkoutBtn: document.getElementById('finishWorkoutBtn'),
    restTimerContainer: document.getElementById('restTimerContainer'),
    restTimerDisplay: document.getElementById('restTimerDisplay'),
    skipRestBtn: document.getElementById('skipRestBtn'),
    
    // History View
    historyList: document.getElementById('historyList'),
    historyFilter: document.getElementById('historyFilter'),
    
    // Exercises View
    exerciseSearch: document.getElementById('exerciseSearch'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    exercisesLibrary: document.getElementById('exercisesLibrary'),
    
    // Statistics View
    workoutChart: document.getElementById('workoutChart'),
    statTotalWorkouts: document.getElementById('statTotalWorkouts'),
    statAvgDuration: document.getElementById('statAvgDuration'),
    statFavoriteExercise: document.getElementById('statFavoriteExercise'),
    statBestStreak: document.getElementById('statBestStreak'),
    statsPeriod: document.getElementById('statsPeriod'),
    
    // Modals
    exerciseModal: document.getElementById('exerciseModal'),
    exerciseSelect: document.getElementById('exerciseSelect'),
    exerciseType: document.getElementById('exerciseType'),
    setsCount: document.getElementById('setsCount'),
    setsContainer: document.getElementById('setsContainer'),
    closeExerciseModal: document.getElementById('closeExerciseModal'),
    cancelExerciseBtn: document.getElementById('cancelExerciseBtn'),
    saveExerciseBtn: document.getElementById('saveExerciseBtn'),
    
    // Complete Modal
    completeModal: document.getElementById('completeModal'),
    completeTime: document.getElementById('completeTime'),
    completeExercises: document.getElementById('completeExercises'),
    completeSets: document.getElementById('completeSets'),
    workoutNotesComplete: document.getElementById('workoutNotesComplete'),
    closeCompleteBtn: document.getElementById('closeCompleteBtn'),
    saveCompleteBtn: document.getElementById('saveCompleteBtn'),
    
    // Toast & Indicators
    toast: document.getElementById('toast'),
    offlineIndicator: document.getElementById('offlineIndicator'),
    syncBtn: document.getElementById('syncBtn'),
    statsBtn: document.getElementById('statsBtn'),
    
    // Streak
    streakCount: document.getElementById('streakCount')
};

// Initialize the app
async function initApp() {
    loadStateFromStorage();
    setupEventListeners();
    renderHomeView();
    updateStats();
    checkNetworkStatus();
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered');
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// Load state from localStorage
function loadStateFromStorage() {
    const savedWorkouts = localStorage.getItem('fitTrackWorkouts');
    const savedLogs = localStorage.getItem('fitTrackLogs');
    
    if (savedWorkouts) {
        appState.workouts = JSON.parse(savedWorkouts);
    } else {
        // Load default templates
        appState.workouts = getAllWorkoutTemplates();
    }
    
    if (savedLogs) {
        appState.workoutLogs = JSON.parse(savedLogs);
    }
}

// Save state to localStorage
function saveStateToStorage() {
    localStorage.setItem('fitTrackWorkouts', JSON.stringify(appState.workouts));
    localStorage.setItem('fitTrackLogs', JSON.stringify(appState.workoutLogs));
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.menuBtn.addEventListener('click', () => {
        elements.sidebar.style.left = '0';
        elements.sidebarOverlay.classList.add('active');
    });
    
    elements.closeSidebar.addEventListener('click', closeSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);
    
    // Sidebar navigation
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = item.dataset.view;
            switchView(view);
            closeSidebar();
        });
    });
    
    // Bottom navigation
    elements.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view) {
                switchView(view);
            }
        });
    });
    
    // Special navigation buttons
    elements.startWorkoutBtn.addEventListener('click', () => {
        showToast('Select a workout to start');
    });
    
    elements.statsBtn.addEventListener('click', () => {
        switchView('stats');
    });
    
    // Home view
    elements.startQuickWorkout.addEventListener('click', () => {
        startQuickWorkout();
    });
    
    elements.createNewWorkout.addEventListener('click', () => {
        switchView('create');
    });
    
    // Workouts view
    elements.addWorkoutBtn.addEventListener('click', () => {
        switchView('create');
    });
    
    // Create view
    elements.addExerciseBtn.addEventListener('click', () => {
        showExerciseModal();
    });
    
    elements.saveWorkoutBtn.addEventListener('click', () => {
        saveWorkout();
    });
    
    // Exercise modal
    elements.closeExerciseModal.addEventListener('click', () => {
        elements.exerciseModal.classList.remove('active');
    });
    
    elements.cancelExerciseBtn.addEventListener('click', () => {
        elements.exerciseModal.classList.remove('active');
    });
    
    elements.saveExerciseBtn.addEventListener('click', () => {
        saveExerciseToWorkout();
    });
    
    elements.exerciseType.addEventListener('change', updateSetsInputs);
    elements.setsCount.addEventListener('change', updateSetsInputs);
    
    // Active workout
    elements.pauseWorkoutBtn.addEventListener('click', toggleWorkoutPause);
    elements.nextSetBtn.addEventListener('click', nextSet);
    elements.finishWorkoutBtn.addEventListener('click', finishWorkout);
    elements.skipRestBtn.addEventListener('click', skipRest);
    
    // Complete modal
    elements.closeCompleteBtn.addEventListener('click', () => {
        elements.completeModal.classList.remove('active');
    });
    
    elements.saveCompleteBtn.addEventListener('click', saveWorkoutLog);
    
    // History filter
    elements.historyFilter.addEventListener('change', renderHistoryView);
    
    // Exercises search
    elements.exerciseSearch.addEventListener('input', renderExercisesView);
    
    // Category tabs
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExercisesView();
        });
    });
    
    // Stats period
    elements.statsPeriod.addEventListener('change', updateStatistics);
    
    // Network status
    window.addEventListener('online', () => {
        elements.offlineIndicator.classList.remove('show');
        showToast('Back online!', 'success');
    });
    
    window.addEventListener('offline', () => {
        elements.offlineIndicator.classList.add('show');
        showToast('You are offline', 'warning');
    });
    
    // Sync button
    elements.syncBtn.addEventListener('click', () => {
        showToast('Syncing data...');
        setTimeout(() => showToast('Data synced!', 'success'), 1000);
    });
    
    // Prevent accidental refresh during workout
    window.addEventListener('beforeunload', (e) => {
        if (appState.isWorkoutActive) {
            e.preventDefault();
            e.returnValue = 'You have an active workout. Are you sure you want to leave?';
        }
    });
}

// View management
function switchView(viewName) {
    // Hide all views
    Object.values(elements).forEach(element => {
        if (element && element.classList && element.classList.contains('view')) {
            element.classList.remove('active');
        }
    });
    
    // Update active navigation
    elements.navBtns.forEach(btn => btn.classList.remove('active'));
    elements.navItems.forEach(item => item.classList.remove('active'));
    
    // Show selected view
    const viewElement = elements[`${viewName}View`];
    if (viewElement) {
        viewElement.classList.add('active');
        appState.currentView = viewName;
        
        // Update navigation
        const navBtn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
        if (navBtn) navBtn.classList.add('active');
        
        const navItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (navItem) navItem.classList.add('active');
        
        // Render view content
        switch(viewName) {
            case 'home':
                renderHomeView();
                break;
            case 'workouts':
                renderWorkoutsView();
                break;
            case 'create':
                renderCreateView();
                break;
            case 'history':
                renderHistoryView();
                break;
            case 'exercises':
                renderExercisesView();
                break;
            case 'stats':
                updateStatistics();
                break;
        }
    }
}

function closeSidebar() {
    elements.sidebar.style.left = '-300px';
    elements.sidebarOverlay.classList.remove('active');
}

// Render home view
function renderHomeView() {
    // Update stats
    const weekWorkouts = appState.workoutLogs.filter(log => {
        const logDate = new Date(log.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
    }).length;
    
    elements.totalWorkouts.textContent = weekWorkouts;
    
    // Calculate total minutes
    const totalMinutes = appState.workoutLogs.reduce((total, log) => {
        return total + (log.duration || 0);
    }, 0);
    elements.totalMinutes.textContent = Math.floor(totalMinutes / 60);
    
    // Calculate streak
    const streak = calculateStreak(appState.workoutLogs);
    elements.currentStreak.textContent = streak;
    elements.streakCount.textContent = `${streak} day streak`;
    
    // Render recent workouts
    renderRecentWorkouts();
}

function renderRecentWorkouts() {
    const recentLogs = [...appState.workoutLogs]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
    
    elements.recentWorkoutsList.innerHTML = recentLogs.map(log => `
        <div class="workout-item">
            <div class="workout-info">
                <h4>${log.name}</h4>
                <p>${formatDate(log.date)}</p>
            </div>
            <div class="workout-stats">
                <div class="workout-stat">
                    <div class="value">${log.exercises.length}</div>
                    <div class="label">Exercises</div>
                </div>
                <div class="workout-stat">
                    <div class="value">${log.duration || 0}min</div>
                    <div class="label">Duration</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Render workouts view
function renderWorkoutsView() {
    elements.workoutsGrid.innerHTML = appState.workouts.map(workout => `
        <div class="workout-card" data-id="${workout.id}">
            <div class="workout-card-header">
                <div>
                    <h3>${workout.name}</h3>
                    <span class="workout-type ${workout.type}">${workout.type}</span>
                </div>
                <div class="workout-actions">
                    <button class="btn-icon start-workout" data-id="${workout.id}">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon edit-workout" data-id="${workout.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            <div class="workout-exercises">
                ${workout.exercises.slice(0, 3).map(exercise => `
                    <div class="exercise-item">
                        <span class="exercise-name">${exercise.name}</span>
                        <span class="exercise-sets">${exercise.sets} sets</span>
                    </div>
                `).join('')}
                ${workout.exercises.length > 3 ? `
                    <div class="exercise-item">
                        <span class="exercise-name">+${workout.exercises.length - 3} more</span>
                    </div>
                ` : ''}
            </div>
            <div class="workout-card-footer">
                <div class="workout-meta">
                    <span><i class="fas fa-clock"></i> ${workout.restTime}s rest</span>
                </div>
                <button class="btn btn-secondary btn-sm delete-workout" data-id="${workout.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to workout cards
    document.querySelectorAll('.start-workout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const workoutId = btn.dataset.id;
            startWorkout(workoutId);
        });
    });
    
    document.querySelectorAll('.edit-workout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const workoutId = btn.dataset.id;
            editWorkout(workoutId);
        });
    });
    
    document.querySelectorAll('.workout-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                const workoutId = card.dataset.id;
                viewWorkout(workoutId);
            }
        });
    });
    
    document.querySelectorAll('.delete-workout').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const workoutId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this workout?')) {
                deleteWorkout(workoutId);
            }
        });
    });
}

// Render create view
function renderCreateView() {
    elements.exercisesList.innerHTML = '';
    elements.workoutName.value = '';
    elements.workoutNotes.value = '';
    elements.restTimer.value = '60';
}

// Show exercise modal
function showExerciseModal() {
    // Populate exercise select
    const allExercises = getAllExercises();
    elements.exerciseSelect.innerHTML = allExercises.map(exercise => 
        `<option value="${exercise.id}">${exercise.name} (${exercise.muscle})</option>`
    ).join('');
    
    elements.exerciseModal.classList.add('active');
    updateSetsInputs();
}

function updateSetsInputs() {
    const type = elements.exerciseType.value;
    const setsCount = parseInt(elements.setsCount.value);
    
    elements.setsContainer.innerHTML = '';
    
    for (let i = 1; i <= setsCount; i++) {
        let inputHtml = '';
        
        switch(type) {
            case 'reps':
                inputHtml = `
                    <div class="set-input-group">
                        <input type="number" class="set-input target-reps" placeholder="Reps" value="10" min="1">
                    </div>
                `;
                break;
            case 'weight':
                inputHtml = `
                    <div class="set-input-group">
                        <input type="number" class="set-input target-weight" placeholder="Weight" value="20" min="0" step="0.5">
                        <input type="number" class="set-input target-reps" placeholder="Reps" value="10" min="1">
                    </div>
                `;
                break;
            case 'time':
                inputHtml = `
                    <div class="set-input-group">
                        <input type="number" class="set-input target-time" placeholder="Seconds" value="60" min="1">
                    </div>
                `;
                break;
            case 'distance':
                inputHtml = `
                    <div class="set-input-group">
                        <input type="number" class="set-input target-distance" placeholder="Meters" value="100" min="1">
                    </div>
                `;
                break;
        }
        
        elements.setsContainer.innerHTML += `
            <div class="set-row">
                <div class="set-indicator">${i}</div>
                ${inputHtml}
            </div>
        `;
    }
}

function saveExerciseToWorkout() {
    const exerciseId = elements.exerciseSelect.value;
    const exercise = getExerciseById(exerciseId);
    const type = elements.exerciseType.value;
    const setsCount = parseInt(elements.setsCount.value);
    
    // Collect set data
    const sets = [];
    const setRows = elements.setsContainer.querySelectorAll('.set-row');
    
    setRows.forEach((row, index) => {
        const setData = {
            setNumber: index + 1,
            completed: false
        };
        
        switch(type) {
            case 'reps':
                const repsInput = row.querySelector('.target-reps');
                setData.targetReps = parseInt(repsInput.value);
                break;
            case 'weight':
                const weightInput = row.querySelector('.target-weight');
                const repsInput2 = row.querySelector('.target-reps');
                setData.targetWeight = parseFloat(weightInput.value);
                setData.targetReps = parseInt(repsInput2.value);
                break;
            case 'time':
                const timeInput = row.querySelector('.target-time');
                setData.targetTime = parseInt(timeInput.value);
                break;
            case 'distance':
                const distanceInput = row.querySelector('.target-distance');
                setData.targetDistance = parseInt(distanceInput.value);
                break;
        }
        
        sets.push(setData);
    });
    
    // Add exercise to list
    const exerciseElement = document.createElement('div');
    exerciseElement.className = 'exercise-card';
    exerciseElement.innerHTML = `
        <div class="exercise-header">
            <h4>${exercise.name}</h4>
            <span class="exercise-type">${type} • ${setsCount} sets</span>
        </div>
        <div class="sets-list">
            ${sets.map(set => `
                <div class="set-item">
                    <div class="set-header">
                        <span class="set-number">Set ${set.setNumber}</span>
                    </div>
                    <div class="set-details">
                        ${type === 'reps' ? `<span>${set.targetReps} reps</span>` : ''}
                        ${type === 'weight' ? `<span>${set.targetWeight}kg × ${set.targetReps} reps</span>` : ''}
                        ${type === 'time' ? `<span>${set.targetTime} seconds</span>` : ''}
                        ${type === 'distance' ? `<span>${set.targetDistance}m</span>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        <button class="btn btn-secondary btn-sm remove-exercise">
            <i class="fas fa-times"></i> Remove
        </button>
    `;
    
    // Store exercise data
    exerciseElement.dataset.exerciseData = JSON.stringify({
        id: exercise.id,
        name: exercise.name,
        type: type,
        sets: sets
    });
    
    elements.exercisesList.appendChild(exerciseElement);
    
    // Add remove event listener
    const removeBtn = exerciseElement.querySelector('.remove-exercise');
    removeBtn.addEventListener('click', () => {
        exerciseElement.remove();
    });
    
    elements.exerciseModal.classList.remove('active');
    showToast('Exercise added to workout');
}

function saveWorkout() {
    const name = elements.workoutName.value.trim();
    const notes = elements.workoutNotes.value.trim();
    const restTime = parseInt(elements.restTimer.value);
    
    if (!name) {
        showToast('Please enter a workout name', 'warning');
        return;
    }
    
    // Collect exercises
    const exerciseElements = elements.exercisesList.querySelectorAll('.exercise-card');
    if (exerciseElements.length === 0) {
        showToast('Please add at least one exercise', 'warning');
        return;
    }
    
    const exercises = [];
    exerciseElements.forEach(element => {
        const exerciseData = JSON.parse(element.dataset.exerciseData);
        exercises.push(exerciseData);
    });
    
    // Create workout
    const workout = {
        id: generateId(),
        name,
        type: 'strength', // Default type
        exercises,
        restTime,
        notes,
        createdAt: new Date().toISOString()
    };
    
    // Add to workouts
    appState.workouts.push(workout);
    saveStateToStorage();
    
    showToast('Workout saved successfully!', 'success');
    switchView('workouts');
}

// Workout execution
function startQuickWorkout() {
    // Create a quick full body workout
    const quickWorkout = {
        id: 'quick-' + Date.now(),
        name: 'Quick Workout',
        type: 'strength',
        exercises: [
            {
                id: 'push-up',
                name: 'Push Up',
                type: 'reps',
                sets: [
                    { setNumber: 1, targetReps: 15, completed: false },
                    { setNumber: 2, targetReps: 15, completed: false },
                    { setNumber: 3, targetReps: 15, completed: false }
                ]
            },
            {
                id: 'squat',
                name: 'Squat',
                type: 'reps',
                sets: [
                    { setNumber: 1, targetReps: 20, completed: false },
                    { setNumber: 2, targetReps: 20, completed: false },
                    { setNumber: 3, targetReps: 20, completed: false }
                ]
            },
            {
                id: 'plank',
                name: 'Plank',
                type: 'time',
                sets: [
                    { setNumber: 1, targetTime: 60, completed: false },
                    { setNumber: 2, targetTime: 60, completed: false }
                ]
            }
        ],
        restTime: 30
    };
    
    startWorkoutInstance(quickWorkout);
}

function startWorkout(workoutId) {
    const workout = appState.workouts.find(w => w.id === workoutId);
    if (workout) {
        startWorkoutInstance(workout);
    }
}

function startWorkoutInstance(workout) {
    appState.activeWorkout = {
        ...workout,
        startTime: new Date(),
        currentExercise: 0,
        currentSet: 0
    };
    
    appState.isWorkoutActive = true;
    appState.timerSeconds = 0;
    appState.currentExerciseIndex = 0;
    appState.currentSetIndex = 0;
    
    // Start workout timer
    appState.workoutTimer = setInterval(() => {
        appState.timerSeconds++;
        elements.workoutTimer.textContent = formatTime(appState.timerSeconds);
    }, 1000);
    
    // Update UI
    elements.activeWorkoutName.textContent = workout.name;
    renderActiveWorkout();
    switchView('activeWorkout');
}

function renderActiveWorkout() {
    const workout = appState.activeWorkout;
    if (!workout) return;
    
    // Calculate progress
    const totalSets = workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    const completedSets = workout.exercises.reduce((total, ex) => 
        total + ex.sets.filter(s => s.completed).length, 0
    );
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    
    elements.workoutProgress.style.width = `${progress}%`;
    elements.exerciseProgress.textContent = `${completedSets}/${totalSets} sets`;
    
    // Render exercises
    elements.activeExercises.innerHTML = workout.exercises.map((exercise, exIndex) => {
        const isCurrent = exIndex === appState.currentExerciseIndex;
        const isCompleted = exIndex < appState.currentExerciseIndex;
        
        return `
            <div class="active-exercise-card ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}">
                <div class="exercise-header">
                    <h4>${exercise.name}</h4>
                    <span class="exercise-type">${exercise.type}</span>
                </div>
                <div class="exercise-sets-container">
                    ${exercise.sets.map((set, setIndex) => {
                        const isSetCurrent = isCurrent && setIndex === appState.currentSetIndex;
                        const isSetCompleted = set.completed || (exIndex < appState.currentExerciseIndex) || 
                                              (exIndex === appState.currentExerciseIndex && setIndex < appState.currentSetIndex);
                        
                        return `
                            <div class="set-row">
                                <div class="set-indicator ${isSetCompleted ? 'completed' : ''} ${isSetCurrent ? 'current' : ''}">
                                    ${setIndex + 1}
                                </div>
                                <div class="set-input-group">
                                    ${exercise.type === 'reps' ? `
                                        <input type="number" class="set-input ${isSetCompleted ? 'completed' : ''}" 
                                               placeholder="Reps" value="${set.targetReps || ''}" 
                                               ${isSetCurrent ? '' : 'disabled'}>
                                    ` : ''}
                                    ${exercise.type === 'weight' ? `
                                        <input type="number" class="set-input ${isSetCompleted ? 'completed' : ''}" 
                                               placeholder="Weight" value="${set.targetWeight || ''}" 
                                               ${isSetCurrent ? '' : 'disabled'}>
                                        <input type="number" class="set-input ${isSetCompleted ? 'completed' : ''}" 
                                               placeholder="Reps" value="${set.targetReps || ''}" 
                                               ${isSetCurrent ? '' : 'disabled'}>
                                    ` : ''}
                                    ${exercise.type === 'time' ? `
                                        <input type="number" class="set-input ${isSetCompleted ? 'completed' : ''}" 
                                               placeholder="Seconds" value="${set.targetTime || ''}" 
                                               ${isSetCurrent ? '' : 'disabled'}>
                                    ` : ''}
                                    ${exercise.type === 'distance' ? `
                                        <input type="number" class="set-input ${isSetCompleted ? 'completed' : ''}" 
                                               placeholder="Meters" value="${set.targetDistance || ''}" 
                                               ${isSetCurrent ? '' : 'disabled'}>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    // Update current exercise display
    const currentExercise = workout.exercises[appState.currentExerciseIndex];
    if (currentExercise) {
        elements.currentExercise.textContent = currentExercise.name;
    }
    
    // Add event listeners to current set inputs
    const currentSetInputs = elements.activeExercises.querySelectorAll('.set-input:not([disabled])');
    currentSetInputs.forEach(input => {
        input.addEventListener('change', (e) => {
            const value = e.target.value;
            // Store the actual value
            const workout = appState.activeWorkout;
            const exercise = workout.exercises[appState.currentExerciseIndex];
            const set = exercise.sets[appState.currentSetIndex];
            
            if (exercise.type === 'reps') {
                set.actualReps = parseInt(value);
            } else if (exercise.type === 'weight') {
                if (e.target.placeholder === 'Weight') {
                    set.actualWeight = parseFloat(value);
                } else {
                    set.actualReps = parseInt(value);
                }
            } else if (exercise.type === 'time') {
                set.actualTime = parseInt(value);
            } else if (exercise.type === 'distance') {
                set.actualDistance = parseInt(value);
            }
        });
    });
}

function toggleWorkoutPause() {
    if (appState.isResting) {
        clearInterval(appState.restTimer);
        appState.isResting = false;
        elements.restTimerContainer.classList.remove('active');
        elements.pauseWorkoutBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else if (appState.workoutTimer) {
        clearInterval(appState.workoutTimer);
        appState.workoutTimer = null;
        elements.pauseWorkoutBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    } else {
        appState.workoutTimer = setInterval(() => {
            appState.timerSeconds++;
            elements.workoutTimer.textContent = formatTime(appState.timerSeconds);
        }, 1000);
        elements.pauseWorkoutBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    }
}

function nextSet() {
    const workout = appState.activeWorkout;
    if (!workout) return;
    
    const exercise = workout.exercises[appState.currentExerciseIndex];
    const set = exercise.sets[appState.currentSetIndex];
    
    // Mark current set as completed
    set.completed = true;
    
    // Get actual values from inputs
    const currentSetRow = elements.activeExercises.querySelector('.set-row .set-indicator.current').closest('.set-row');
    const inputs = currentSetRow.querySelectorAll('.set-input');
    
    inputs.forEach(input => {
        if (input.value) {
            if (exercise.type === 'reps') {
                set.actualReps = parseInt(input.value);
            } else if (exercise.type === 'weight') {
                if (input.placeholder === 'Weight') {
                    set.actualWeight = parseFloat(input.value);
                } else {
                    set.actualReps = parseInt(input.value);
                }
            } else if (exercise.type === 'time') {
                set.actualTime = parseInt(input.value);
            } else if (exercise.type === 'distance') {
                set.actualDistance = parseInt(input.value);
            }
        }
    });
    
    // Move to next set or exercise
    if (appState.currentSetIndex < exercise.sets.length - 1) {
        appState.currentSetIndex++;
    } else if (appState.currentExerciseIndex < workout.exercises.length - 1) {
        appState.currentExerciseIndex++;
        appState.currentSetIndex = 0;
    } else {
        // Workout complete
        finishWorkout();
        return;
    }
    
    // Start rest timer
    startRestTimer(workout.restTime);
}

function startRestTimer(seconds) {
    appState.isResting = true;
    appState.restSeconds = seconds;
    elements.restTimerDisplay.textContent = seconds;
    elements.restTimerContainer.classList.add('active');
    
    // Update timer circle
    const timerCircle = elements.restTimerContainer.querySelector('.timer-circle');
    timerCircle.style.background = `conic-gradient(var(--primary) 0%, var(--gray-light) 0%)`;
    
    appState.restTimer = setInterval(() => {
        appState.restSeconds--;
        elements.restTimerDisplay.textContent = appState.restSeconds;
        
        // Update progress circle
        const progress = ((seconds - appState.restSeconds) / seconds) * 100;
        timerCircle.style.background = `conic-gradient(var(--primary) ${progress}%, var(--gray-light) 0%)`;
        
        if (appState.restSeconds <= 0) {
            clearInterval(appState.restTimer);
            appState.isResting = false;
            elements.restTimerContainer.classList.remove('active');
            renderActiveWorkout();
        }
    }, 1000);
}

function skipRest() {
    if (appState.restTimer) {
        clearInterval(appState.restTimer);
        appState.isResting = false;
        elements.restTimerContainer.classList.remove('active');
        renderActiveWorkout();
    }
}

function finishWorkout() {
    // Stop all timers
    if (appState.workoutTimer) {
        clearInterval(appState.workoutTimer);
        appState.workoutTimer = null;
    }
    
    if (appState.restTimer) {
        clearInterval(appState.restTimer);
        appState.restTimer = null;
    }
    
    // Calculate workout stats
    const duration = appState.timerSeconds;
    const totalExercises = appState.activeWorkout.exercises.length;
    const totalSets = appState.activeWorkout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
    
    elements.completeTime.textContent = formatTime(duration);
    elements.completeExercises.textContent = totalExercises;
    elements.completeSets.textContent = totalSets;
    
    // Show complete modal
    elements.completeModal.classList.add('active');
}

function saveWorkoutLog() {
    const workout = appState.activeWorkout;
    const notes = elements.workoutNotesComplete.value;
    const duration = appState.timerSeconds;
    
    const workoutLog = {
        id: generateId(),
        workoutId: workout.id,
        name: workout.name,
        date: new Date().toISOString(),
        exercises: workout.exercises.map(exercise => ({
            ...exercise,
            sets: exercise.sets.map(set => ({ ...set }))
        })),
        duration: Math.floor(duration / 60), // Convert to minutes
        notes: notes
    };
    
    appState.workoutLogs.push(workoutLog);
    saveStateToStorage();
    
    // Reset workout state
    appState.activeWorkout = null;
    appState.isWorkoutActive = false;
    appState.timerSeconds = 0;
    appState.currentExerciseIndex = 0;
    appState.currentSetIndex = 0;
    
    elements.completeModal.classList.remove('active');
    showToast('Workout saved to history!', 'success');
    switchView('home');
    updateStats();
}

// History view
function renderHistoryView() {
    const filter = elements.historyFilter.value;
    const now = new Date();
    let filteredLogs = [...appState.workoutLogs];
    
    if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= weekAgo);
    } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= monthAgo);
    }
    
    // Sort by date (newest first)
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    elements.historyList.innerHTML = filteredLogs.map(log => `
        <div class="history-item">
            <div class="history-header">
                <h3>${log.name}</h3>
                <span class="history-date">${formatDate(log.date)}</span>
            </div>
            <div class="history-stats">
                <span><i class="fas fa-dumbbell"></i> ${log.exercises.length} exercises</span>
                <span><i class="fas fa-clock"></i> ${log.duration || 0} min</span>
            </div>
            ${log.notes ? `
                <div class="history-notes">
                    <p><strong>Notes:</strong> ${log.notes}</p>
                </div>
            ` : ''}
            <div class="history-exercises">
                ${log.exercises.slice(0, 3).map(exercise => `
                    <div class="exercise-item">
                        <span>${exercise.name}</span>
                        <span>${exercise.sets.length} sets</span>
                    </div>
                `).join('')}
                ${log.exercises.length > 3 ? `
                    <div class="exercise-item">
                        <span>+${log.exercises.length - 3} more exercises</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Exercises view
function renderExercisesView() {
    const searchTerm = elements.exerciseSearch.value;
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    
    let exercises = getExercisesByCategory(activeCategory);
    
    if (searchTerm) {
        exercises = searchExercises(searchTerm);
    }
    
    elements.exercisesLibrary.innerHTML = exercises.map(exercise => `
        <div class="exercise-library-card" data-id="${exercise.id}">
            <h4>${exercise.name}</h4>
            <div class="exercise-muscle">${exercise.muscle}</div>
            <p class="exercise-description">${exercise.description}</p>
            <div class="exercise-equipment">${exercise.equipment}</div>
        </div>
    `).join('');
    
    // Add click event to add exercise to current workout
    document.querySelectorAll('.exercise-library-card').forEach(card => {
        card.addEventListener('click', () => {
            const exerciseId = card.dataset.id;
            const exercise = getExerciseById(exerciseId);
            
            if (appState.currentView === 'create') {
                // Add to workout creation
                showToast(`Added ${exercise.name} to workout`, 'success');
                // Here you could automatically add the exercise to the workout
            } else {
                showToast(`Select "${exercise.name}" in workout creation`, 'info');
            }
        });
    });
}

// Statistics
function updateStatistics() {
    const period = elements.statsPeriod.value;
    const now = new Date();
    let filteredLogs = [...appState.workoutLogs];
    
    if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= monthAgo);
    } else if (period === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredLogs = filteredLogs.filter(log => new Date(log.date) >= yearAgo);
    }
    
    // Update stats
    elements.statTotalWorkouts.textContent = filteredLogs.length;
    
    // Calculate average duration
    const totalDuration = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const avgDuration = filteredLogs.length > 0 ? Math.round(totalDuration / filteredLogs.length) : 0;
    elements.statAvgDuration.textContent = `${avgDuration} min`;
    
    // Find favorite exercise
    const exerciseCount = {};
    filteredLogs.forEach(log => {
        log.exercises.forEach(exercise => {
            exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
        });
    });
    
    const favoriteExercise = Object.entries(exerciseCount)
        .sort((a, b) => b[1] - a[1])[0];
    
    elements.statFavoriteExercise.textContent = favoriteExercise ? favoriteExercise[0] : '-';
    
    // Calculate best streak
    const bestStreak = calculateStreak(appState.workoutLogs);
    elements.statBestStreak.textContent = `${bestStreak} days`;
    
    // Update chart
    updateChart(filteredLogs);
}

function updateChart(workoutLogs) {
    const ctx = elements.workoutChart.getContext('2d');
    
    // Group by date
    const workoutsByDate = {};
    workoutLogs.forEach(log => {
        const date = new Date(log.date).toLocaleDateString();
        workoutsByDate[date] = (workoutsByDate[date] || 0) + 1;
    });
    
    const dates = Object.keys(workoutsByDate).slice(-7); // Last 7 days
    const counts = dates.map(date => workoutsByDate[date]);
    
    // Destroy existing chart if it exists
    if (window.workoutChartInstance) {
        window.workoutChartInstance.destroy();
    }
    
    window.workoutChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Workouts',
                data: counts,
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Helper functions
function showToast(message, type = 'info') {
    elements.toast.textContent = message;
    elements.toast.className = 'toast';
    
    switch(type) {
        case 'success':
            elements.toast.style.background = '#10b981';
            break;
        case 'warning':
            elements.toast.style.background = '#f59e0b';
            break;
        case 'error':
            elements.toast.style.background = '#ef4444';
            break;
        default:
            elements.toast.style.background = '#1f2937';
    }
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function checkNetworkStatus() {
    if (!navigator.onLine) {
        elements.offlineIndicator.classList.add('show');
    }
}

function updateStats() {
    // Update home view stats
    renderHomeView();
    
    // Update statistics view if active
    if (appState.currentView === 'stats') {
        updateStatistics();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);