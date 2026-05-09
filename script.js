  let tasks = JSON.parse(localStorage.getItem('tm-tasks') || '[]');
  let currentFilter = 'all';

  function save() {
    localStorage.setItem('tm-tasks', JSON.stringify(tasks));
  }

  function addTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) { input.focus(); return; }

    tasks.unshift({
      id: Date.now(),
      text,
      done: false,
      priority: document.getElementById('priority-sel').value,
      category: document.getElementById('category-sel').value,
      created: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    });

    input.value = '';
    save();
    render();
  }

  function toggleDone(id) {
    const t = tasks.find(t => t.id === id);
    if (t) { t.done = !t.done; save(); render(); }
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
    render();
  }

  function setFilter(f) {
    currentFilter = f;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === f);
    });
    render();
  }

  function render() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pending = total - done;
    const pct = total ? Math.round(done / total * 100) : 0;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent = done;
    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-pct').textContent = pct + '%';
    document.getElementById('progress').style.width = pct + '%';
    document.getElementById('prog-label').textContent = pct + '% done';

    document.getElementById('fc-all').textContent = total;
    document.getElementById('fc-pending').textContent = pending;
    document.getElementById('fc-done').textContent = done;

    let filtered = tasks;
    if (currentFilter === 'pending') filtered = tasks.filter(t => !t.done);
    if (currentFilter === 'done') filtered = tasks.filter(t => t.done);

    const container = document.getElementById('tasks-container');

    if (filtered.length === 0) {
      container.innerHTML = `<div class="empty-state">
        <div class="big">Nothing here.</div>
        <p>${currentFilter === 'done' ? 'Complete a task to see it here.' : 'Add a task above to get started.'}</p>
      </div>`;
      return;
    }

    const pendingTasks = filtered.filter(t => !t.done);
    const doneTasks = filtered.filter(t => t.done);
    let html = '';

    if (pendingTasks.length > 0) {
      if (currentFilter === 'all') html += `<div class="section-header"><span class="section-title">To do</span><div class="section-line"></div></div>`;
      pendingTasks.forEach(t => { html += taskHTML(t); });
    }

    if (doneTasks.length > 0) {
      if (currentFilter === 'all') html += `<div class="section-header"><span class="section-title">Completed</span><div class="section-line"></div></div>`;
      doneTasks.forEach(t => { html += taskHTML(t); });
    }

    container.innerHTML = html;
  }

  function taskHTML(t) {
    const pLabel = { high: 'High', medium: 'Med', low: 'Low' }[t.priority];
    return `<div class="task-card p-${t.priority} ${t.done ? 'done' : ''}" id="tc-${t.id}">
      <div class="task-check" onclick="toggleDone(${t.id})" role="checkbox" aria-checked="${t.done}" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')toggleDone(${t.id})">
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="task-body">
        <div class="task-text">${escHtml(t.text)}</div>
        <div class="task-meta">
          <span class="tag p-${t.priority}">${pLabel}</span>
          <span class="tag">${escHtml(t.category)}</span>
          <span class="task-date">${t.created}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="icon-btn" onclick="deleteTask(${t.id})" title="Delete">✕</button>
      </div>
    </div>`;
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Enter key
  document.getElementById('task-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });

  // Today's date
  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // Seed some tasks if fresh
  if (tasks.length === 0) {
    tasks = [
      { id: 1, text: 'Review project proposal', done: false, priority: 'high', category: 'work', created: 'Today' },
      { id: 2, text: 'Design new landing page mockup', done: false, priority: 'medium', category: 'design', created: 'Today' },
      { id: 3, text: 'Fix login bug on mobile', done: true, priority: 'high', category: 'dev', created: 'Yesterday' },
      { id: 4, text: 'Read chapter 5 of the book', done: false, priority: 'low', category: 'personal', created: 'Yesterday' },
    ];
    save();
  }

  render();
