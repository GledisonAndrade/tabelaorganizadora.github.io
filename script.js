document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const habitsContainer = document.getElementById('habits-container');
    const habitInput = document.getElementById('habit-input');
    const habitCategory = document.getElementById('habit-category');
    const addHabitBtn = document.getElementById('add-habit-btn');
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    const themeToggle = document.getElementById('theme-toggle');
    const aboutBtn = document.getElementById('about-btn');
    const aboutModal = document.getElementById('about-modal');
    const closeButtons = document.querySelectorAll('.close');
    const editModal = document.getElementById('edit-modal');
    const editHabitText = document.getElementById('edit-habit-text');
    const editHabitCategory = document.getElementById('edit-habit-category');
    const editHabitNotes = document.getElementById('edit-habit-notes');
    const saveEditBtn = document.getElementById('save-edit-btn');
    
    // Variáveis de estado
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';
    let currentEditingHabit = null;
    
    // Inicialização
    initTheme();
    renderHabits();
    
    // Event Listeners
    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addHabit();
    });
    
    categoryFilter.addEventListener('change', renderHabits);
    statusFilter.addEventListener('change', renderHabits);
    themeToggle.addEventListener('click', toggleTheme);
    aboutBtn.addEventListener('click', () => aboutModal.style.display = 'flex');
    saveEditBtn.addEventListener('click', saveEditedHabit);
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            aboutModal.style.display = 'none';
            editModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === aboutModal) aboutModal.style.display = 'none';
        if (e.target === editModal) editModal.style.display = 'none';
    });
    
    // Funções
    function initTheme() {
        document.documentElement.setAttribute('data-theme', currentTheme);
        const icon = themeToggle.querySelector('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
        
        const icon = themeToggle.querySelector('i');
        icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    function addHabit() {
        const text = habitInput.value.trim();
        const category = habitCategory.value;
        
        if (text) {
            const newHabit = {
                id: Date.now(),
                text,
                category,
                completed: false,
                createdAt: new Date().toISOString(),
                notes: null
            };
            
            habits.unshift(newHabit);
            saveHabits();
            renderHabits();
            habitInput.value = '';
            habitInput.focus();
        }
    }
    
    function renderHabits() {
        const category = categoryFilter.value;
        const status = statusFilter.value;
        
        let filteredHabits = [...habits];
        
        if (category !== 'all') {
            filteredHabits = filteredHabits.filter(h => h.category === category);
        }
        
        if (status !== 'all') {
            filteredHabits = filteredHabits.filter(h => 
                status === 'completed' ? h.completed : !h.completed
            );
        }
        
        habitsContainer.innerHTML = '';
        
        if (filteredHabits.length === 0) {
            habitsContainer.innerHTML = '<p class="no-habits">Nenhum hábito encontrado</p>';
            return;
        }
        
        filteredHabits.forEach(habit => {
            const habitEl = document.createElement('div');
            habitEl.className = 'habit-item';
            habitEl.innerHTML = `
                <div class="habit-info">
                    <div class="habit-color category-${habit.category}"></div>
                    <div class="habit-text-container">
                        <span class="habit-text ${habit.completed ? 'completed' : ''}">${habit.text}</span>
                        ${habit.notes ? `
                            <div class="habit-notes">
                                <i class="fas fa-sticky-note habit-notes-icon" data-id="${habit.id}"></i>
                                ${habit.notes}
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="habit-actions">
                    <button class="edit-btn" data-id="${habit.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="complete-btn ${habit.completed ? 'completed' : ''}" data-id="${habit.id}">
                        <i class="fas fa-${habit.completed ? 'check-circle' : 'circle'}"></i>
                    </button>
                    <button class="delete-btn" data-id="${habit.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            habitsContainer.appendChild(habitEl);
        });
        
        // Adicionar eventos aos botões
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                toggleComplete(id);
            });
        });
        
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                deleteHabit(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                openEditModal(id);
            });
        });
        
        document.querySelectorAll('.habit-notes-icon').forEach(icon => {
            icon.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                openEditModal(id);
            });
        });
    }
    
    function toggleComplete(id) {
        habits = habits.map(habit => {
            if (habit.id === id) {
                return {...habit, completed: !habit.completed};
            }
            return habit;
        });
        
        saveHabits();
        renderHabits();
    }
    
    function deleteHabit(id) {
        if (confirm('Tem certeza que deseja excluir este hábito?')) {
            habits = habits.filter(habit => habit.id !== id);
            saveHabits();
            renderHabits();
        }
    }
    
    function openEditModal(id) {
        const habit = habits.find(h => h.id === id);
        if (habit) {
            currentEditingHabit = habit;
            editHabitText.value = habit.text;
            editHabitCategory.value = habit.category;
            editHabitNotes.value = habit.notes || '';
            editModal.style.display = 'flex';
        }
    }
    
    function saveEditedHabit() {
        if (currentEditingHabit) {
            const text = editHabitText.value.trim();
            const category = editHabitCategory.value;
            const notes = editHabitNotes.value.trim();
            
            if (text) {
                habits = habits.map(habit => {
                    if (habit.id === currentEditingHabit.id) {
                        return {
                            ...habit,
                            text,
                            category,
                            notes: notes || null
                        };
                    }
                    return habit;
                });
                
                saveHabits();
                renderHabits();
                editModal.style.display = 'none';
                currentEditingHabit = null;
            }
        }
    }
    
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
});
