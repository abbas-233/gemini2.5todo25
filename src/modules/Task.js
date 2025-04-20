// Task.js - Task class and related operations
import { format, parseISO } from 'date-fns';

export default class Task {
    constructor(text, dueDate, priority = 'medium', completed = false, description = '') {
        this.id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
        this.text = text;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = ['low', 'medium', 'high'].includes(priority) ? priority : 'medium';
        this.completed = completed;
        this.project = null;
    }

    static createTaskElement(task, onComplete, onDelete, onUpdate, todoList) {
        console.log(`Rendering task ${task.id}, Priority from data:`, task.priority);

        const li = document.createElement('li');
        li.setAttribute('data-id', task.id);
        li.className = ''; // Reset classes
        li.classList.add(`priority-${task.priority}`);
        if (task.completed) li.classList.add('completed');

        // --- Containers --- 
        const taskViewContainer = document.createElement('div'); // Holds view mode elements
        taskViewContainer.classList.add('task-view-container');

        const taskEditContainer = document.createElement('div'); // Holds edit mode elements
        taskEditContainer.classList.add('task-edit-container');
        taskEditContainer.style.display = 'none'; // Hidden initially


        // --- View Mode Elements --- 
        const taskTopRow = document.createElement('div');
        taskTopRow.classList.add('task-top-row');

        const taskContent = document.createElement('div');
        taskContent.classList.add('task-content');

        const taskSpan = document.createElement('span');
        taskSpan.classList.add('task-text'); // Add class for easier selection
        taskSpan.textContent = task.text;

        const dateSpan = document.createElement('span');
        dateSpan.classList.add('due-date');
        try {
            if (task.dueDate) {
                li.setAttribute('data-due-date', task.dueDate); // Keep data attribute on li
                dateSpan.textContent = format(parseISO(task.dueDate), 'MMM d, yyyy');
            } else {
                dateSpan.textContent = 'No date';
            }
        } catch (e) {
            console.error("Error formatting date:", task.dueDate, e);
            dateSpan.textContent = 'Invalid date';
        }

        taskContent.appendChild(taskSpan);
        taskContent.appendChild(dateSpan);

        const taskViewButtons = document.createElement('div');
        taskViewButtons.classList.add('task-buttons');

        const completeBtn = document.createElement('button');
        completeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';
        completeBtn.classList.add('complete-btn');
        completeBtn.setAttribute('aria-label', 'Mark task complete');
        completeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCompleted = !li.classList.contains('completed');
            task.completed = isCompleted; // Update task object first
            onComplete(task.id, isCompleted); // Persist change
            // Update UI directly
            li.classList.toggle('completed', isCompleted);
            taskSpan.style.textDecoration = isCompleted ? 'line-through' : 'none';
            taskSpan.style.color = isCompleted ? 'var(--color-text-secondary)' : 'inherit';
            // Also update description view if it exists and is visible
            const descriptionView = li.querySelector('.task-description-view');
            if (descriptionView) {
                 descriptionView.style.textDecoration = isCompleted ? 'line-through' : 'none';
                 descriptionView.style.color = isCompleted ? 'var(--color-text-secondary)' : 'inherit';
            }
        });

        const editBtn = document.createElement('button'); // Create Edit Button
        editBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 0 24 24" width="18px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.26 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>';
        editBtn.classList.add('edit-btn');
        editBtn.setAttribute('aria-label', 'Edit task');

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.setAttribute('aria-label', 'Delete task');
        deleteBtn.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            onDelete(task.id); 
        });

        taskViewButtons.appendChild(completeBtn);
        taskViewButtons.appendChild(editBtn); // Add Edit button
        taskViewButtons.appendChild(deleteBtn);

        taskTopRow.appendChild(taskContent);
        taskTopRow.appendChild(taskViewButtons);

        const taskDescriptionView = document.createElement('div');
        taskDescriptionView.classList.add('task-description-view');
        taskDescriptionView.textContent = task.description || 'No description.';
        taskDescriptionView.style.display = 'none'; // Hidden initially

        // Add View mode elements to the view container
        taskViewContainer.appendChild(taskTopRow);
        taskViewContainer.appendChild(taskDescriptionView);

        // --- Edit Mode Elements ---
        const inputTitle = document.createElement('input');
        inputTitle.type = 'text';
        inputTitle.classList.add('edit-task-title');
        inputTitle.value = task.text;

        const textareaDescription = document.createElement('textarea');
        textareaDescription.classList.add('edit-task-description');
        textareaDescription.value = task.description;
        textareaDescription.placeholder = 'Add description...';
        textareaDescription.rows = 3;

        // Project Selector (NEW)
        const projectSelectContainer = document.createElement('div');
        projectSelectContainer.classList.add('edit-task-project');
        const projectLabel = document.createElement('label');
        projectLabel.textContent = 'Project: ';
        projectLabel.setAttribute('for', `project-select-${task.id}`); // Unique ID for label
        const projectSelect = document.createElement('select');
        projectSelect.id = `project-select-${task.id}`; // Unique ID for select

        // Option for 'Inbox' (no project)
        const inboxOption = document.createElement('option');
        inboxOption.value = ''; // Use empty string to represent no project
        inboxOption.textContent = 'Inbox';
        projectSelect.appendChild(inboxOption);

        // Populate with existing projects
        if (todoList && todoList.data && todoList.data.projects) {
            todoList.data.projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.name;
                option.textContent = project.name;
                if (task.project === project.name) {
                    option.selected = true; // Select the current project
                }
                projectSelect.appendChild(option);
            });
        } else {
            console.warn("Could not access projects from todoList for task:", task.id);
        }

        projectSelectContainer.appendChild(projectLabel);
        projectSelectContainer.appendChild(projectSelect);

        const taskEditButtons = document.createElement('div');
        taskEditButtons.classList.add('task-edit-buttons');

        const saveBtn = document.createElement('button');
        saveBtn.textContent = 'Save';
        saveBtn.classList.add('save-btn');

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.classList.add('cancel-btn');

        taskEditButtons.appendChild(saveBtn);
        taskEditButtons.appendChild(cancelBtn);

        // Add Edit mode elements to the edit container
        taskEditContainer.appendChild(inputTitle);
        taskEditContainer.appendChild(textareaDescription);
        taskEditContainer.appendChild(projectSelectContainer); // Add project selector
        taskEditContainer.appendChild(taskEditButtons);


        // --- Event Listeners --- 

        // Toggle description visibility (only when NOT editing)
        taskTopRow.addEventListener('click', () => {
             if (!li.classList.contains('editing')) { // Only toggle if not editing
                li.classList.toggle('expanded');
                taskDescriptionView.style.display = li.classList.contains('expanded') ? 'block' : 'none';
            }
        });

        // Switch to Edit Mode
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Task ${task.id}: Switching to edit mode`); // Log edit start
            li.classList.add('editing');
            li.classList.remove('expanded'); // Ensure not expanded during edit
            taskViewContainer.style.display = 'none';
            taskEditContainer.style.display = 'flex'; // Use flex for edit layout
            taskDescriptionView.style.display = 'none'; // Hide description view
            console.log(`Task ${task.id}: View container display = ${taskViewContainer.style.display}, Edit container display = ${taskEditContainer.style.display}`); // Log display styles
            inputTitle.focus(); // Focus on title input
            inputTitle.value = task.text; // Ensure fresh values
            textareaDescription.value = task.description;
            // Ensure project dropdown reflects current task project
            projectSelect.value = task.project || ''; // Set to empty string if null/undefined
        });

        // Save Changes
        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Task ${task.id}: Save button clicked`); // Log save click
            const newTitle = inputTitle.value.trim();
            const newDescription = textareaDescription.value.trim();
            const newProject = projectSelect.value; // Get selected project name

            if (newTitle) {
                // Update task object directly for immediate UI feedback (optional but good)
                const projectChanged = task.project !== (newProject || null); // Check if project changed
                task.text = newTitle;
                task.description = newDescription;
                task.project = newProject || null; // Update project (null if 'Inbox')

                taskSpan.textContent = newTitle;
                taskDescriptionView.textContent = newDescription || 'No description.';

                // Persist changes including potential project change
                onUpdate(task.id, newTitle, newDescription, newProject); // Pass newProject

                // Switch back to view mode
                li.classList.remove('editing');
                taskEditContainer.style.display = 'none';
                taskViewContainer.style.display = 'block'; // Should be block or flex depending on original style
                console.log(`Task ${task.id}: Switched back to view mode after save. View display = ${taskViewContainer.style.display}, Edit display = ${taskEditContainer.style.display}`); // Log display styles

                // If project changed, might need to re-render the list depending on current view
                if (projectChanged && todoList) {
                     console.log(`Task ${task.id}: Project changed to ${newProject || 'Inbox'}. Re-rendering current view.`);
                     todoList.refreshCurrentView(); // Call a method to refresh the UI
                }
            } else {
                alert('Task title cannot be empty.');
            }
        });

        // Cancel Edit
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Task ${task.id}: Cancel button clicked`); // Log cancel click
            li.classList.remove('editing');
            taskEditContainer.style.display = 'none';
            taskViewContainer.style.display = 'block'; // Should be block or flex depending on original style
             console.log(`Task ${task.id}: Switched back to view mode after cancel. View display = ${taskViewContainer.style.display}, Edit display = ${taskEditContainer.style.display}`); // Log display styles
            // Reset inputs to original values (optional, but good practice)
             inputTitle.value = task.text;
             textareaDescription.value = task.description;
             projectSelect.value = task.project || ''; // Reset project dropdown too
        });

        // --- Append Containers to li --- 
        li.appendChild(taskViewContainer);
        li.appendChild(taskEditContainer);

        // Initial completed state styling (moved up)
        if (task.completed) {
            li.classList.add('completed');
            taskSpan.style.textDecoration = 'line-through';
            taskSpan.style.color = '#868e96';
        } else {
             li.classList.remove('completed');
             taskSpan.style.textDecoration = 'none';
             taskSpan.style.color = 'inherit';
        }

        return li;
    }
} 