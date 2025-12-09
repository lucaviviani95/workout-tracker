// ========== IMPORTS ==========
import {
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
} from './workout-data.js';

// ========== UTILITY FUNCTIONS ==========
function normalizeWorkoutStructure(workout) {
    if (!workout) return workout;
    
    // Check if exercises exist and need normalization
    if (!workout.exercises || !Array.isArray(workout.exercises)) {
        return workout;
    }
    
    const normalizedExercises = workout.exercises.map(exercise => {
        // If sets is already an array, return as is
        if (Array.isArray(exercise.sets)) {
            return exercise;
        }
        
        // If sets is a number (old format), convert to array
        if (typeof exercise.sets === 'number') {
            const setsCount = exercise.sets;
            const sets = [];
            
            for (let i = 1; i <= setsCount; i++) {
                const set = {
                    setNumber: i,
                    completed: false
                };
                
                // Copy properties based on exercise type
                if (exercise.type === 'reps') {
                    set.targetReps = exercise.targetReps || 0;
                    if (exercise.targetWeight !== undefined) {
                        set.targetWeight = exercise.targetWeight;
                    }
                } else if (exercise.type === 'time') {
                    set.targetTime = exercise.targetTime || 0;
                } else if (exercise.type === 'distance') {
                    set.targetDistance = exercise.targetDistance || 0;
                } else if (exercise.type === 'weight') {
                    set.targetReps = exercise.targetReps || 0;
                    set.targetWeight = exercise.targetWeight || 0;
                }
                
                sets.push(set);
            }
            
            return {
                ...exercise,
                sets: sets
            };
        }
        
        // If sets doesn't exist, create empty array
        return {
            ...exercise,
            sets: []
        };
    });
    
    return {
        ...workout,
        exercises: normalizedExercises
    };
}

// ========== STATE MANAGEMENT ==========
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

// ========== DOM ELEMENTS ==========
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
    cancelWorkoutBtn: document.getElementById('cancelWorkoutBtn'),
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
    
    // Cancel Modal
    cancelConfirmModal: document.getElementById('cancelConfirmModal'),
    keepWorkoutBtn: document.getElementById('keepWorkoutBtn'),
    confirmCancelBtn: document.getElementById('confirmCancelBtn'),
    
    // Toast & Indicators
    toast: document.getElementById('toast'),
    offlineIndicator: document.getElementById('offlineIndicator'),
    syncBtn: document.getElementById('syncBtn'),
    statsBtn: document.getElementById('statsBtn'),
    
    // Streak
    streakCount: document.getElementById('streakCount')
};

// ========== INITIALIZATION ==========
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

function loadStateFromStorage() {
    const savedWorkouts = localStorage.getItem('fitTrackWorkouts');
    const savedLogs = localStorage.getItem('fitTrackLogs');
    
    if (savedWorkouts) {
        try {
            const parsedWorkouts = JSON.parse(savedWorkouts);
            // Normalize all workouts to ensure consistent structure
            appState.workouts = parsedWorkouts.map(normalizeWorkoutStructure);
        } catch (error) {
            console.error('Error parsing saved workouts:', error);
            // Load default templates if error
            appState.workouts = getAllWorkoutTemplates().map(normalizeWorkoutStructure);
        }
    } else {
        // Load default templates and normalize them
        appState.workouts = getAllWorkoutTemplates().map(normalizeWorkoutStructure);
    }
    
    if (savedLogs) {
        try {
            appState.workoutLogs = JSON.parse(savedLogs);
        } catch (error) {
            console.error('Error parsing saved logs:', error);
            appState.workoutLogs = [];
        }
    }
}

function saveStateToStorage() {
    localStorage.setItem('fitTrackWorkouts', JSON.stringify(appState.workouts));
    localStorage.setItem('fitTrackLogs', JSON.stringify(appState.workoutLogs));
}

// ========== EVENT LISTENERS ==========
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Navigation
    if (elements.menuBtn) {
        elements.menuBtn.addEventListener('click', () => {
            elements.sidebar.style.left = '0';
            elements.sidebarOverlay.classList.add('active');
        });
    }
    
    if (elements.closeSidebar) {
        elements.closeSidebar.addEventListener('click', closeSidebar);
    }
    
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', closeSidebar);
    }
    
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
    if (elements.startWorkoutBtn) {
        elements.startWorkoutBtn.addEventListener('click', () => {
            showToast('Select a workout to start');
        });
    }
    
    if (elements.statsBtn) {
        elements.statsBtn.addEventListener('click', () => {
            switchView('stats');
        });
    }
    
    // Home view
    if (elements.startQuickWorkout) {
        elements.startQuickWorkout.addEventListener('click', startQuickWorkout);
    }
    
    if (elements.createNewWorkout) {
        elements.createNewWorkout.addEventListener('click', () => switchView('create'));
    }
    
    // Workouts view
    if (elements.addWorkoutBtn) {
        elements.addWorkoutBtn.addEventListener('click', () => switchView('create'));
    }
    
    // Create view
    if (elements.addExerciseBtn) {
        elements.addExerciseBtn.addEventListener('click', showExerciseModal);
    }
    
    if (elements.saveWorkoutBtn) {
        elements.saveWorkoutBtn.addEventListener('click', saveWorkout);
    }
    
    // Exercise modal
    if (elements.closeExerciseModal) {
        elements.closeExerciseModal.addEventListener('click', () => {
            elements.exerciseModal.classList.remove('active');
        });
    }
    
    if (elements.cancelExerciseBtn) {
        elements.cancelExerciseBtn.addEventListener('click', () => {
            elements.exerciseModal.classList.remove('active');
        });
    }
    
    if (elements.saveExerciseBtn) {
        elements.saveExerciseBtn.addEventListener('click', saveExerciseToWorkout);
    }
    
    if (elements.exerciseType) {
        elements.exerciseType.addEventListener('change', updateSetsInputs);
    }
    
    if (elements.setsCount) {
        elements.setsCount.addEventListener('change', updateSetsInputs);
    }
    
    // Active workout buttons - CRITICAL SECTION
    console.log('Setting up workout control buttons...');
    
    if (elements.pauseWorkoutBtn) {
        console.log('Pause button found, attaching listener');
        elements.pauseWorkoutBtn.addEventListener('click', function(e) {
            console.log('Pause button clicked!', e);
            e.stopPropagation();
            toggleWorkoutPause();
        });
    } else {
        console.error('Pause workout button not found!');
    }
    
    if (elements.nextSetBtn) {
        console.log('Next set button found, attaching listener');
        elements.nextSetBtn.addEventListener('click', function(e) {
            console.log('Next set button clicked!', e);
            e.stopPropagation();
            nextSet();
        });
    } else {
        console.error('Next set button not found!');
    }
    
    if (elements.finishWorkoutBtn) {
        console.log('Finish button found, attaching listener');
        elements.finishWorkoutBtn.addEventListener('click', function(e) {
            console.log('Finish button clicked!', e);
            e.stopPropagation();
            finishWorkout();
        });
    } else {
        console.error('Finish workout button not found!');
    }
    
    if (elements.cancelWorkoutBtn) {
        console.log('Cancel button found, attaching listener');
        elements.cancelWorkoutBtn.addEventListener('click', function(e) {
            console.log('Cancel button clicked!', e);
            e.stopPropagation();
            showCancelConfirmation();
        });
    } else {
        console.error('Cancel workout button not found!');
    }
    
    if (elements.skipRestBtn) {
        elements.skipRestBtn.addEventListener('click', skipRest);
    }
    
    // Complete modal
    if (elements.closeCompleteBtn) {
        elements.closeCompleteBtn.addEventListener('click', () => {
            elements.completeModal.classList.remove('active');
        });
    }
    
    if (elements.saveCompleteBtn) {
        elements.saveCompleteBtn.addEventListener('click', saveWorkoutLog);
    }
    
    // Cancel modal
    if (elements.keepWorkoutBtn) {
        elements.keepWorkoutBtn.addEventListener('click', () => {
            elements.cancelConfirmModal.classList.remove('active');
        });
    }
    
    if (elements.confirmCancelBtn) {
        elements.confirmCancelBtn.addEventListener('click', confirmCancelWorkout);
    }
    
    // History filter
    if (elements.historyFilter) {
        elements.historyFilter.addEventListener('change', renderHistoryView);
    }
    
    // Exercises search
    if (elements.exerciseSearch) {
        elements.exerciseSearch.addEventListener('input', renderExercisesView);
    }
    
    // Category tabs
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExercisesView();
        });
    });
    
    // Stats period
    if (elements.statsPeriod) {
        elements.statsPeriod.addEventListener('change', updateStatistics);
    }
    
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
    if (elements.syncBtn) {
        elements.syncBtn.addEventListener('click', () => {
            showToast('Syncing data...');
            setTimeout(() => showToast('Data synced!', 'success'), 1000);
        });
    }
    
    // Prevent accidental refresh during workout
    window.addEventListener('beforeunload', (e) => {
        if (appState.isWorkoutActive) {
            e.preventDefault();
            e.returnValue = 'You have an active workout. Are you sure you want to leave?';
        }
    });
    
    console.log('Event listeners setup complete');
}

function debugEventListeners() {
    console.log('=== Event Listeners Debug ===');
    
    // Check workout control buttons
    const workoutButtons = [
        'pauseWorkoutBtn',
        'nextSetBtn', 
        'finishWorkoutBtn',
        'cancelWorkoutBtn'
    ];
    
    workoutButtons.forEach(btnId => {
        const element = elements[btnId];
        if (!element) {
            console.error(`❌ ${btnId}: Element not found in elements object`);
        } else {
            console.log(`✅ ${btnId}: Element found`);
            // Check if event listener is attached
            const listeners = getEventListeners(element);
            console.log(`   Event listeners:`, listeners ? Object.keys(listeners) : 'None');
        }
    });
    
    console.log('Active Workout State:', {
        isWorkoutActive: appState.isWorkoutActive,
        activeWorkout: appState.activeWorkout
    });
}

// Call this after initApp to check
// debugEventListeners();

// ========== VIEW MANAGEMENT ==========
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

// ========== HOME VIEW ==========
function renderHomeView() {
    // Update stats
    const weekWorkouts = appState.workoutLogs.filter(log => {
        if (!log || !log.date) return false;
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
                <h4>${log.name || 'Unnamed Workout'}</h4>
                <p>${formatDate(log.date)}</p>
            </div>
            <div class="workout-stats">
                <div class="workout-stat">
                    <div class="value">${log.exercises ? log.exercises.length : 0}</div>
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

// ========== WORKOUTS VIEW ==========
function renderWorkoutsView() {
    elements.workoutsGrid.innerHTML = appState.workouts.map(workout => {
        // Calculate total sets for this workout
        const totalSets = workout.exercises.reduce((total, exercise) => 
            total + (exercise.sets ? exercise.sets.length : 0), 0);
        
        return `
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
                ${workout.exercises.slice(0, 3).map(exercise => {
                    // Handle both old and new exercise formats
                    const setsCount = exercise.sets ? exercise.sets.length : 0;
                    return `
                    <div class="exercise-item">
                        <span class="exercise-name">${exercise.name}</span>
                        <span class="exercise-sets">${setsCount} sets</span>
                    </div>
                    `;
                }).join('')}
                ${workout.exercises.length > 3 ? `
                    <div class="exercise-item">
                        <span class="exercise-name">+${workout.exercises.length - 3} more</span>
                    </div>
                ` : ''}
            </div>
            <div class="workout-card-footer">
                <div class="workout-meta">
                    <span><i class="fas fa-clock"></i> ${workout.restTime || 60}s rest</span>
                    <span><i class="fas fa-dumbbell"></i> ${totalSets} total sets</span>
                </div>
                <button class="btn btn-secondary btn-sm delete-workout" data-id="${workout.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
    
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

// ========== CREATE VIEW ==========
function renderCreateView() {
    elements.exercisesList.innerHTML = '';
    elements.workoutName.value = '';
    elements.workoutNotes.value = '';
    elements.restTimer.value = '60';
    
    // Reset type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.type-btn[data-type="strength"]').classList.add('active');
    
    // Reset save button
    elements.saveWorkoutBtn.innerHTML = '<i class="fas fa-save"></i> Save Workout';
    delete elements.saveWorkoutBtn.dataset.editId;
}

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
    const setsCount = parseInt(elements.setsCount.value) || 3;
    
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
                setData.targetReps = parseInt(repsInput.value) || 0;
                break;
            case 'weight':
                const weightInput = row.querySelector('.target-weight');
                const repsInput2 = row.querySelector('.target-reps');
                setData.targetWeight = parseFloat(weightInput.value) || 0;
                setData.targetReps = parseInt(repsInput2.value) || 0;
                break;
            case 'time':
                const timeInput = row.querySelector('.target-time');
                setData.targetTime = parseInt(timeInput.value) || 0;
                break;
            case 'distance':
                const distanceInput = row.querySelector('.target-distance');
                setData.targetDistance = parseInt(distanceInput.value) || 0;
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
            <span class="exercise-type">${type} • ${sets.length} sets</span>
        </div>
        <div class="sets-list">
            ${sets.map(set => {
                let setText = '';
                switch(type) {
                    case 'reps':
                        setText = `${set.targetReps} reps`;
                        break;
                    case 'weight':
                        setText = `${set.targetWeight}kg × ${set.targetReps} reps`;
                        break;
                    case 'time':
                        setText = `${set.targetTime} seconds`;
                        break;
                    case 'distance':
                        setText = `${set.targetDistance}m`;
                        break;
                }
                return `
                <div class="set-item">
                    <div class="set-header">
                        <span class="set-number">Set ${set.setNumber}</span>
                    </div>
                    <div class="set-details">
                        <span>${setText}</span>
                    </div>
                </div>
                `;
            }).join('')}
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
    const restTime = parseInt(elements.restTimer.value) || 60;
    const workoutType = document.querySelector('.type-btn.active')?.dataset.type || 'strength';
    const isEditing = elements.saveWorkoutBtn.dataset.editId;
    
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
    
    if (isEditing) {
        // Update existing workout
        const index = appState.workouts.findIndex(w => w.id === isEditing);
        if (index !== -1) {
            appState.workouts[index] = {
                ...appState.workouts[index],
                name: name,
                type: workoutType,
                exercises: exercises,
                restTime: restTime,
                notes: notes,
                updatedAt: new Date().toISOString()
            };
            showToast('Workout updated successfully!', 'success');
        } else {
            showToast('Workout not found', 'error');
            return;
        }
    } else {
        // Create new workout
        const workout = {
            id: generateId(),
            name: name,
            type: workoutType,
            exercises: exercises,
            restTime: restTime,
            notes: notes,
            createdAt: new Date().toISOString()
        };
        
        appState.workouts.push(workout);
        showToast('Workout saved successfully!', 'success');
    }
    
    saveStateToStorage();
    
    // Clear form
    elements.workoutName.value = '';
    elements.workoutNotes.value = '';
    elements.exercisesList.innerHTML = '';
    delete elements.saveWorkoutBtn.dataset.editId;
    elements.saveWorkoutBtn.innerHTML = '<i class="fas fa-save"></i> Save Workout';
    
    // Switch back to workouts view
    setTimeout(() => {
        renderWorkoutsView();
        switchView('workouts');
    }, 500);
}

// ========== WORKOUT DETAILS & EDITING ==========
function viewWorkout(workoutId) {
    const workout = appState.workouts.find(w => w.id === workoutId);
    if (!workout) {
        showToast('Workout not found', 'error');
        return;
    }
    
    // Ensure workout has proper structure
    const normalizedWorkout = normalizeWorkoutStructure(workout);
    showWorkoutDetails(normalizedWorkout);
}

function showWorkoutDetails(workout) {
    // Create modal content
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${workout.name}</h3>
                <button class="close-modal" id="closeDetailsModal">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="workout-details">
                    <div class="detail-row">
                        <span class="detail-label">Type:</span>
                        <span class="detail-value ${workout.type}">${workout.type}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Rest Time:</span>
                        <span class="detail-value">${workout.restTime || 60} seconds</span>
                    </div>
                    ${workout.notes ? `
                    <div class="detail-row">
                        <span class="detail-label">Notes:</span>
                        <span class="detail-value">${workout.notes}</span>
                    </div>
                    ` : ''}
                    
                    <div class="exercises-details">
                        <h4>Exercises (${workout.exercises.length})</h4>
                        ${workout.exercises.map((exercise, index) => {
                            if (!exercise || !exercise.sets || !Array.isArray(exercise.sets)) {
                                return `<div class="exercise-detail">Invalid exercise data</div>`;
                            }
                            return `
                            <div class="exercise-detail">
                                <div class="exercise-detail-header">
                                    <h5>${index + 1}. ${exercise.name}</h5>
                                    <span class="exercise-type">${exercise.type}</span>
                                </div>
                                <div class="exercise-sets-details">
                                    ${exercise.sets.map((set, setIndex) => {
                                        let setText = '';
                                        if (exercise.type === 'reps') {
                                            setText = `${set.targetReps || 0} reps`;
                                        } else if (exercise.type === 'weight') {
                                            setText = `${set.targetWeight || 0}kg × ${set.targetReps || 0} reps`;
                                        } else if (exercise.type === 'time') {
                                            setText = `${set.targetTime || 0} seconds`;
                                        } else if (exercise.type === 'distance') {
                                            setText = `${set.targetDistance || 0}m`;
                                        }
                                        return `
                                        <div class="set-detail">
                                            <span class="set-number">Set ${setIndex + 1}:</span>
                                            <span>${setText}</span>
                                        </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="editWorkoutBtn" data-id="${workout.id}">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-primary" id="startThisWorkoutBtn" data-id="${workout.id}">
                    <i class="fas fa-play"></i> Start Workout
                </button>
            </div>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'workoutDetailsModal';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('closeDetailsModal').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('startThisWorkoutBtn').addEventListener('click', () => {
        modal.remove();
        startWorkout(workout.id);
    });
    
    document.getElementById('editWorkoutBtn').addEventListener('click', () => {
        modal.remove();
        editWorkout(workout.id);
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function editWorkout(workoutId) {
    const workout = appState.workouts.find(w => w.id === workoutId);
    if (!workout) {
        showToast('Workout not found', 'error');
        return;
    }
    
    // Switch to create view
    switchView('create');
    
    // Clear existing exercises
    elements.exercisesList.innerHTML = '';
    
    // Populate form with workout data
    elements.workoutName.value = workout.name;
    elements.workoutNotes.value = workout.notes || '';
    elements.restTimer.value = workout.restTime || 60;
    
    // Set workout type
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.type === workout.type) {
            btn.classList.add('active');
        }
    });
    
    // Add exercises from the workout
    workout.exercises.forEach(exercise => {
        const exerciseElement = document.createElement('div');
        exerciseElement.className = 'exercise-card';
        
        // Format sets display
        let setsDisplay = '';
        if (exercise.type === 'reps') {
            setsDisplay = exercise.sets.map(set => `${set.targetReps} reps`).join(', ');
        } else if (exercise.type === 'weight') {
            setsDisplay = exercise.sets.map(set => `${set.targetWeight || 0}kg × ${set.targetReps} reps`).join(', ');
        } else if (exercise.type === 'time') {
            setsDisplay = exercise.sets.map(set => `${set.targetTime} seconds`).join(', ');
        } else if (exercise.type === 'distance') {
            setsDisplay = exercise.sets.map(set => `${set.targetDistance}m`).join(', ');
        }
        
        exerciseElement.innerHTML = `
            <div class="exercise-header">
                <h4>${exercise.name}</h4>
                <span class="exercise-type">${exercise.type} • ${exercise.sets ? exercise.sets.length : 0} sets</span>
            </div>
            <div class="sets-list">
                ${exercise.sets ? exercise.sets.map(set => {
                    let setText = '';
                    switch(exercise.type) {
                        case 'reps':
                            setText = `${set.targetReps || 0} reps`;
                            break;
                        case 'weight':
                            setText = `${set.targetWeight || 0}kg × ${set.targetReps || 0} reps`;
                            break;
                        case 'time':
                            setText = `${set.targetTime || 0} seconds`;
                            break;
                        case 'distance':
                            setText = `${set.targetDistance || 0}m`;
                            break;
                    }
                    return `
                    <div class="set-item">
                        <div class="set-header">
                            <span class="set-number">Set ${set.setNumber || 1}</span>
                        </div>
                        <div class="set-details">
                            <span>${setText}</span>
                        </div>
                    </div>
                    `;
                }).join('') : ''}
            </div>
            <button class="btn btn-secondary btn-sm remove-exercise">
                <i class="fas fa-times"></i> Remove
            </button>
        `;
        
        // Store exercise data
        exerciseElement.dataset.exerciseData = JSON.stringify({
            id: exercise.id,
            name: exercise.name,
            type: exercise.type,
            sets: exercise.sets || []
        });
        
        elements.exercisesList.appendChild(exerciseElement);
        
        // Add remove event listener
        const removeBtn = exerciseElement.querySelector('.remove-exercise');
        removeBtn.addEventListener('click', () => {
            exerciseElement.remove();
        });
    });
    
    // Store the workout ID for updating
    elements.saveWorkoutBtn.dataset.editId = workout.id;
    elements.saveWorkoutBtn.innerHTML = '<i class="fas fa-save"></i> Update Workout';
    
    showToast('Editing workout: ' + workout.name);
}

function deleteWorkout(workoutId) {
    const index = appState.workouts.findIndex(w => w.id === workoutId);
    if (index !== -1) {
        appState.workouts.splice(index, 1);
        saveStateToStorage();
        renderWorkoutsView();
        showToast('Workout deleted', 'success');
    }
}

// ========== WORKOUT EXECUTION ==========
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
    
    // Normalize and deep clone the quick workout
    const normalizedWorkout = normalizeWorkoutStructure(quickWorkout);
    startWorkoutInstance(normalizedWorkout);
}
function startWorkout(workoutId) {
    const workout = appState.workouts.find(w => w.id === workoutId);
    if (workout) {
        // Ensure workout has proper structure before starting
        const normalizedWorkout = normalizeWorkoutStructure(workout);
        startWorkoutInstance(normalizedWorkout);
    }
}

function deepCloneWorkoutStructured(workout) {
    if (!workout) return null;
    
    const clonedWorkout = { ...workout };
    
    // Deep clone exercises
    if (workout.exercises && Array.isArray(workout.exercises)) {
        clonedWorkout.exercises = workout.exercises.map(exercise => {
            const clonedExercise = { ...exercise };
            
            // Deep clone sets for each exercise
            if (exercise.sets && Array.isArray(exercise.sets)) {
                clonedExercise.sets = exercise.sets.map(set => ({
                    ...set,
                    completed: false, // Reset completed status
                    actualReps: undefined,
                    actualWeight: undefined,
                    actualTime: undefined,
                    actualDistance: undefined
                }));
            }
            
            return clonedExercise;
        });
    }
    
    return clonedWorkout;
}

function startWorkoutInstance(workout) {
    // DEEP CLONE the workout to avoid modifying the template
    const workoutCopy = deepCloneWorkoutStructured(workout);
    
    appState.activeWorkout = {
        ...workoutCopy,
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
    const totalSets = workout.exercises.reduce((total, ex) => {
        return total + (ex.sets && Array.isArray(ex.sets) ? ex.sets.length : 0);
    }, 0);
    
    const completedSets = workout.exercises.reduce((total, ex) => {
        if (!ex.sets || !Array.isArray(ex.sets)) return total;
        return total + ex.sets.filter(s => s.completed).length;
    }, 0);
    
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
                    ${exercise.sets && Array.isArray(exercise.sets) ? exercise.sets.map((set, setIndex) => {
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
                    }).join('') : '<p>No sets available</p>'}
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
                set.actualReps = parseInt(value) || 0;
            } else if (exercise.type === 'weight') {
                if (e.target.placeholder === 'Weight') {
                    set.actualWeight = parseFloat(value) || 0;
                } else {
                    set.actualReps = parseInt(value) || 0;
                }
            } else if (exercise.type === 'time') {
                set.actualTime = parseInt(value) || 0;
            } else if (exercise.type === 'distance') {
                set.actualDistance = parseInt(value) || 0;
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
    const currentSetRow = elements.activeExercises.querySelector('.set-row .set-indicator.current')?.closest('.set-row');
    if (currentSetRow) {
        const inputs = currentSetRow.querySelectorAll('.set-input');
        
        inputs.forEach(input => {
            if (input.value) {
                if (exercise.type === 'reps') {
                    set.actualReps = parseInt(input.value) || 0;
                } else if (exercise.type === 'weight') {
                    if (input.placeholder === 'Weight') {
                        set.actualWeight = parseFloat(input.value) || 0;
                    } else {
                        set.actualReps = parseInt(input.value) || 0;
                    }
                } else if (exercise.type === 'time') {
                    set.actualTime = parseInt(input.value) || 0;
                } else if (exercise.type === 'distance') {
                    set.actualDistance = parseInt(input.value) || 0;
                }
            }
        });
    }
    
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
    startRestTimer(workout.restTime || 60);
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

// ========== CANCEL WORKOUT FUNCTIONALITY ==========
function showCancelConfirmation() {
    const workout = appState.activeWorkout;
    if (!workout) return;
    
    // Calculate progress to give appropriate warning
    const totalSets = workout.exercises.reduce((total, ex) => 
        total + (ex.sets ? ex.sets.length : 0), 0);
    
    const completedSets = workout.exercises.reduce((total, ex) => {
        if (!ex.sets || !Array.isArray(ex.sets)) return total;
        return total + ex.sets.filter(s => s.completed).length;
    }, 0);
    
    let message = '';
    if (completedSets === 0) {
        message = 'Are you sure you want to cancel this workout? No sets have been completed yet.';
    } else {
        message = `Are you sure you want to cancel this workout? You've completed ${completedSets} out of ${totalSets} sets.`;
    }
    
    // Update modal message
    const modalBody = elements.cancelConfirmModal.querySelector('.modal-body p');
    if (modalBody) {
        modalBody.textContent = message;
    }
    
    elements.cancelConfirmModal.classList.add('active');
}

function confirmCancelWorkout() {
    // Stop all timers
    stopAllTimers();
    
    // Reset workout state
    resetWorkoutState();
    
    // Close modal and return to home
    elements.cancelConfirmModal.classList.remove('active');
    
    // Show notification
    showToast('Workout cancelled', 'warning');
    
    // Return to home view
    setTimeout(() => {
        switchView('home');
    }, 500);
}

// Helper function to stop all timers
function stopAllTimers() {
    if (appState.workoutTimer) {
        clearInterval(appState.workoutTimer);
        appState.workoutTimer = null;
    }
    
    if (appState.restTimer) {
        clearInterval(appState.restTimer);
        appState.restTimer = null;
    }
}

// Helper function to reset workout state
function resetWorkoutState() {
    appState.activeWorkout = null;
    appState.isWorkoutActive = false;
    appState.timerSeconds = 0;
    appState.currentExerciseIndex = 0;
    appState.currentSetIndex = 0;
    appState.isResting = false;
    appState.restSeconds = 0;
}

// ========== FINISH WORKOUT FUNCTIONALITY ==========
function finishWorkout() {
    const workout = appState.activeWorkout;
    if (!workout) return;
    
    // Calculate completed sets
    const completedSets = workout.exercises.reduce((total, ex) => {
        if (!ex.sets || !Array.isArray(ex.sets)) return total;
        return total + ex.sets.filter(s => s.completed).length;
    }, 0);
    
    // If no sets completed, ask user what to do
    if (completedSets === 0) {
        showEmptyWorkoutOptions();
        return;
    }
    
    // If some sets completed, proceed to normal finish
    proceedToWorkoutComplete();
}

function showEmptyWorkoutOptions() {
    // Create modal for empty workout
    const modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>No Sets Completed</h3>
            </div>
            <div class="modal-body">
                <p>You haven't completed any sets in this workout. What would you like to do?</p>
                <div class="empty-workout-options">
                    <button class="btn btn-secondary" id="continueWorkingBtn">
                        <i class="fas fa-redo"></i> Continue Working Out
                    </button>
                    <button class="btn btn-danger" id="discardWorkoutBtn">
                        <i class="fas fa-trash"></i> Discard Workout
                    </button>
                    <button class="btn btn-primary" id="saveAsDraftBtn">
                        <i class="fas fa-save"></i> Save as Draft
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'emptyWorkoutModal';
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('continueWorkingBtn').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('discardWorkoutBtn').addEventListener('click', () => {
        modal.remove();
        discardEmptyWorkout();
    });
    
    document.getElementById('saveAsDraftBtn').addEventListener('click', () => {
        modal.remove();
        saveAsDraft();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function discardEmptyWorkout() {
    // Stop all timers
    stopAllTimers();
    
    // Reset workout state
    resetWorkoutState();
    
    // Show notification
    showToast('Workout discarded (no sets completed)', 'info');
    
    // Return to home view
    setTimeout(() => {
        switchView('home');
    }, 500);
}

function saveAsDraft() {
    const workout = appState.activeWorkout;
    const duration = appState.timerSeconds;
    
    // Create draft workout log
    const workoutLog = {
        id: generateId(),
        workoutId: workout.id,
        name: workout.name,
        date: new Date().toISOString(),
        exercises: workout.exercises.map(exercise => ({
            ...exercise,
            sets: exercise.sets ? exercise.sets.map(set => ({ ...set })) : []
        })),
        duration: Math.floor(duration / 60),
        notes: 'Draft - No sets completed',
        isDraft: true,
        completedSets: 0
    };
    
    appState.workoutLogs.push(workoutLog);
    saveStateToStorage();
    
    // Reset workout state
    resetWorkoutState();
    
    // Show notification
    showToast('Workout saved as draft', 'success');
    
    // Return to home view
    setTimeout(() => {
        switchView('home');
        updateStats();
    }, 500);
}

function proceedToWorkoutComplete() {
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
    const totalSets = appState.activeWorkout.exercises.reduce((total, ex) => 
        total + (ex.sets ? ex.sets.length : 0), 0);
    
    const completedSets = appState.activeWorkout.exercises.reduce((total, ex) => {
        if (!ex.sets || !Array.isArray(ex.sets)) return total;
        return total + ex.sets.filter(s => s.completed).length;
    }, 0);
    
    elements.completeTime.textContent = formatTime(duration);
    elements.completeExercises.textContent = totalExercises;
    elements.completeSets.textContent = `${completedSets}/${totalSets}`;
    
    // Show complete modal
    elements.completeModal.classList.add('active');
}

function saveWorkoutLog() {
    const workout = appState.activeWorkout;
    const notes = elements.workoutNotesComplete.value;
    const duration = appState.timerSeconds;
    
    // Calculate completed sets
    const completedSets = workout.exercises.reduce((total, ex) => {
        if (!ex.sets || !Array.isArray(ex.sets)) return total;
        return total + ex.sets.filter(s => s.completed).length;
    }, 0);
    
    // Don't save if no sets completed (should be prevented by finishWorkout, but just in case)
    if (completedSets === 0) {
        showToast('Cannot save workout with no completed sets', 'warning');
        return;
    }
    
    const workoutLog = {
        id: generateId(),
        workoutId: workout.id,
        name: workout.name,
        date: new Date().toISOString(),
        exercises: workout.exercises.map(exercise => ({
            ...exercise,
            sets: exercise.sets ? exercise.sets.map(set => ({ ...set })) : []
        })),
        duration: Math.floor(duration / 60), // Convert to minutes
        notes: notes,
        completedSets: completedSets
    };
    
    appState.workoutLogs.push(workoutLog);
    saveStateToStorage();
    
    // Reset workout state
    resetWorkoutState();
    
    elements.completeModal.classList.remove('active');
    showToast('Workout saved to history!', 'success');
    switchView('home');
    updateStats();
}

// ========== HISTORY VIEW ==========
function renderHistoryView() {
    const filter = elements.historyFilter.value;
    const now = new Date();
    let filteredLogs = [...appState.workoutLogs];
    
    if (filter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLogs = filteredLogs.filter(log => {
            if (!log.date) return false;
            return new Date(log.date) >= weekAgo;
        });
    } else if (filter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLogs = filteredLogs.filter(log => {
            if (!log.date) return false;
            return new Date(log.date) >= monthAgo;
        });
    }
    
    // Sort by date (newest first)
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    elements.historyList.innerHTML = filteredLogs.map(log => {
        const isDraft = log.isDraft || log.completedSets === 0;
        const completedSets = log.completedSets || 0;
        const totalSets = log.exercises ? log.exercises.reduce((total, ex) => 
            total + (ex.sets ? ex.sets.length : 0), 0) : 0;
        
        return `
        <div class="history-item ${isDraft ? 'draft' : ''}">
            <div class="history-header">
                <h3>
                    ${log.name || 'Unnamed Workout'}
                    ${isDraft ? '<span class="draft-badge">Draft</span>' : ''}
                </h3>
                <span class="history-date">${formatDate(log.date)}</span>
            </div>
            <div class="history-stats">
                <span><i class="fas fa-dumbbell"></i> ${log.exercises ? log.exercises.length : 0} exercises</span>
                <span><i class="fas fa-clock"></i> ${log.duration || 0} min</span>
                <span><i class="fas fa-check-circle"></i> ${completedSets}/${totalSets} sets</span>
            </div>
            ${log.notes ? `
                <div class="history-notes">
                    <p><strong>Notes:</strong> ${log.notes}</p>
                </div>
            ` : ''}
            <div class="history-exercises">
                ${log.exercises ? log.exercises.slice(0, 3).map(exercise => `
                    <div class="exercise-item">
                        <span>${exercise.name}</span>
                        <span>${exercise.sets ? exercise.sets.length : 0} sets</span>
                    </div>
                `).join('') : ''}
                ${log.exercises && log.exercises.length > 3 ? `
                    <div class="exercise-item">
                        <span>+${log.exercises.length - 3} more exercises</span>
                    </div>
                ` : ''}
            </div>
            ${isDraft ? `
                <div class="history-actions">
                    <button class="btn btn-sm btn-secondary delete-draft" data-id="${log.id}">
                        <i class="fas fa-trash"></i> Delete Draft
                    </button>
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
    
    // Add event listeners for delete draft buttons
    document.querySelectorAll('.delete-draft').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const logId = btn.dataset.id;
            if (confirm('Are you sure you want to delete this draft?')) {
                deleteDraft(logId);
            }
        });
    });
}

function deleteDraft(logId) {
    const index = appState.workoutLogs.findIndex(log => log.id === logId);
    if (index !== -1) {
        appState.workoutLogs.splice(index, 1);
        saveStateToStorage();
        renderHistoryView();
        showToast('Draft deleted', 'success');
    }
}

// ========== EXERCISES VIEW ==========
function renderExercisesView() {
    const searchTerm = elements.exerciseSearch.value;
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
    
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
                showToast(`Added ${exercise.name} to workout`, 'success');
            } else {
                showToast(`Select "${exercise.name}" in workout creation`, 'info');
            }
        });
    });
}

// ========== STATISTICS ==========
function updateStatistics() {
    const period = elements.statsPeriod.value;
    const now = new Date();
    let filteredLogs = [...appState.workoutLogs];
    
    if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filteredLogs = filteredLogs.filter(log => {
            if (!log.date) return false;
            return new Date(log.date) >= weekAgo;
        });
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filteredLogs = filteredLogs.filter(log => {
            if (!log.date) return false;
            return new Date(log.date) >= monthAgo;
        });
    } else if (period === 'year') {
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filteredLogs = filteredLogs.filter(log => {
            if (!log.date) return false;
            return new Date(log.date) >= yearAgo;
        });
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
        if (log.exercises) {
            log.exercises.forEach(exercise => {
                if (exercise.name) {
                    exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
                }
            });
        }
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
        if (log.date) {
            const date = new Date(log.date).toLocaleDateString();
            workoutsByDate[date] = (workoutsByDate[date] || 0) + 1;
        }
    });
    
    const dates = Object.keys(workoutsByDate).slice(-7); // Last 7 days
    const counts = dates.map(date => workoutsByDate[date]);
    
    // Destroy existing chart if it exists
    if (window.workoutChartInstance) {
        window.workoutChartInstance.destroy();
    }
    
    if (dates.length === 0) {
        // Show message if no data
        elements.workoutChart.parentElement.innerHTML = '<p class="no-data">No workout data available for the selected period</p>';
        return;
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

// ========== HELPER FUNCTIONS ==========
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

// ========== INITIALIZE APP ==========
document.addEventListener('DOMContentLoaded', initApp);