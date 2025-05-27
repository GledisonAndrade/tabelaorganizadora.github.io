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
    
    // Variáveis de estado
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let currentTheme = localStorage.getItem('theme') || 'light';
    
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
    
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            aboutModal.style.display = 'none';
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === aboutModal) aboutModal.style.display = 'none';
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
                createdAt: new Date().toISOString()
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
                    <span class="habit-text ${habit.completed ? 'completed' : ''}">${habit.text}</span>
                </div>
                <div class="habit-actions">
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
    
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
});