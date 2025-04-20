// UI.js - Handles all DOM interactions and rendering
import Task from './Task';
import Project from './Project';

export default class UI {
    constructor(todoList) {
        this.todoList = todoList;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.addTaskBtn = document.querySelector('.add-task-btn');
        this.taskInputContainer = document.querySelector('.input-container');
        this.taskInput = document.getElementById('taskInput');
        this.taskDescription = document.getElementById('taskDescription');
        this.taskDueDate = document.getElementById('taskDueDate');
        this.taskPriority = document.getElementById('taskPriority');
        this.addTaskConfirmBtn = document.getElementById('addTaskConfirmBtn');
        this.cancelTaskBtn = document.getElementById('cancelTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.contentTitle = document.getElementById('contentTitle');
        this.sidebarItems = document.querySelectorAll('.sidebar li');
        this.projectList = document.getElementById('projectList');
        this.addProjectBtn = document.querySelector('.add-project-btn');
    }

    setupEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.showTaskInput());
        this.addTaskConfirmBtn.addEventListener('click', () => this.handleAddTask());
        this.cancelTaskBtn.addEventListener('click', () => this.hideTaskInput());
        this.taskInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                this.handleAddTask();
            }
        });

        this.sidebarItems.forEach(item => {
            item.addEventListener('click', () => this.handleViewChange(item));
        });

        this.addProjectBtn.addEventListener('click', () => this.handleAddProject());
    }

    showTaskInput() {
        this.taskInputContainer.style.display = 'flex';
        this.addTaskBtn.style.display = 'none';
        this.taskInput.focus();
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const localToday = new Date(today.getTime() - (offset*60*1000));
        this.taskDueDate.value = localToday.toISOString().split('T')[0];
        this.taskPriority.value = 'medium';
        this.taskDescription.value = '';
    }

    hideTaskInput() {
        this.taskInputContainer.style.display = 'none';
        this.addTaskBtn.style.display = 'flex';
        this.taskInput.value = '';
        this.taskDescription.value = '';
        this.taskDueDate.value = '';
        this.taskPriority.value = 'medium';
    }

    handleAddTask() {
        const text = this.taskInput.value.trim();
        const description = this.taskDescription.value.trim();
        const dueDate = this.taskDueDate.value;
        const priority = this.taskPriority.value;

        if (text === '') {
            alert('Please enter a task title!');
            return;
        }
        if (!dueDate) {
            alert('Please select a due date!');
            return;
        }

        this.todoList.addTask(text, dueDate, priority, description);
        this.hideTaskInput();
    }

    handleAddProject() {
        const projectName = prompt('Enter new project name:');
        if (projectName && projectName.trim() !== '') {
            this.todoList.addProject(projectName.trim());
        } else if (projectName !== null) {
            alert('Project name cannot be empty.');
        }
    }

    handleViewChange(item) {
        this.sidebarItems.forEach(i => i.classList.remove('active'));
        document.querySelectorAll('#projectList li').forEach(p => p.classList.remove('active'));
        item.classList.add('active');
        
        const view = item.getAttribute('data-view');
        this.contentTitle.textContent = item.textContent.trim();
        
        if (view !== 'project') {
            this.todoList.setCurrentProject(null);
        }
        
        this.renderTasks(this.todoList.filterTasks(view));
    }

    renderTasks(tasks) {
        this.taskList.innerHTML = '';
        console.log("Rendering tasks:", tasks);
        tasks.forEach(task => {
            if (!task) {
                console.error("Attempted to render an invalid task object.");
                return;
            }
            try {
                const taskElement = Task.createTaskElement(
                    task,
                    (taskId, completed) => this.todoList.toggleTaskComplete(taskId, completed),
                    (taskId) => this.todoList.deleteTask(taskId),
                    (taskId, newText, newDescription, newProject) => {
                        console.log(`UI: Update requested for ${taskId}, Project: ${newProject}`);
                        this.todoList.updateTaskDetails(taskId, newText, newDescription);
                        const currentTask = this.todoList.data.tasks.find(t => t.id === taskId);
                        const targetProject = newProject || null;
                        if (currentTask && currentTask.project !== targetProject) {
                            this.todoList.assignTaskToProject(taskId, targetProject);
                        }
                    },
                    this.todoList
                );
                if (taskElement) {
                    this.taskList.appendChild(taskElement);
                } else {
                    console.error("createTaskElement returned null for task:", task);
                }
            } catch (error) {
                console.error("Error creating task element for task:", task, error);
            }
        });
    }

    renderProjects(projects) {
        this.projectList.innerHTML = '';
        projects.forEach(project => {
            const projectElement = Project.createProjectElement(
                project,
                (project) => {
                    this.sidebarItems.forEach(i => i.classList.remove('active'));
                    document.querySelectorAll('#projectList li').forEach(p => p.classList.remove('active'));
                    projectElement.classList.add('active');
                    this.contentTitle.textContent = `Project: ${project.name}`;
                    this.todoList.setCurrentProject(project.name);
                }
            );
            this.projectList.appendChild(projectElement);
        });
    }

    setInitialView() {
        const inboxItem = document.querySelector('.sidebar li[data-view="inbox"]');
        inboxItem.classList.add('active');
        this.contentTitle.textContent = 'Inbox';
        this.todoList.setCurrentProject(null);
    }
} 