// TodoList.js - Main application logic
import { isToday, isThisWeek, parseISO } from 'date-fns';
import Storage from './Storage';
import Task from './Task';
import Project from './Project';
import UI from './UI';

export default class TodoList {
    constructor() {
        this.data = Storage.loadData();
        this.currentProject = null;
        this.ui = new UI(this);
        this.initialize();
    }

    initialize() {
        this.ui.renderTasks(this.data.tasks);
        this.ui.renderProjects(this.data.projects);
        this.ui.setInitialView();
    }

    addTask(text, dueDate, priority = 'medium', description = '') {
        const task = new Task(text, dueDate, priority, false, description);
        if (this.currentProject) {
            task.project = this.currentProject;
        }
        this.data.tasks.push(task);
        Storage.saveData(this.data);
        this.ui.renderTasks(this.filterTasks(this.currentProject ? 'project' : 'inbox'));
        return task;
    }

    addProject(name) {
        const project = new Project(name);
        this.data.projects.push(project);
        Storage.saveData(this.data);
        this.ui.renderProjects(this.data.projects);
        return project;
    }

    deleteTask(taskId) {
        this.data.tasks = this.data.tasks.filter(task => task.id !== taskId);
        Storage.saveData(this.data);
        this.ui.renderTasks(this.filterTasks(this.currentProject ? 'project' : 'inbox'));
    }

    toggleTaskComplete(taskId, completed) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = completed;
            Storage.saveData(this.data);
        }
    }

    updateTaskPriority(taskId, priority) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.priority = priority;
            Storage.saveData(this.data);
            console.log(`Updated priority for task ${taskId} to ${priority}`);
        }
    }

    updateTaskDetails(taskId, newText, newDescription) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.text = newText;
            task.description = newDescription;
            Storage.saveData(this.data);
            console.log(`Updated details for task ${taskId}: Text='${newText}', Desc='${newDescription}'`);
        } else {
            console.error(`Task not found for update: ${taskId}`);
        }
    }

    setCurrentProject(projectName) {
        this.currentProject = projectName;
        this.ui.renderTasks(this.filterTasks('project'));
    }

    filterTasks(view, projectName = null) {
        return this.data.tasks.filter(task => {
            const dueDate = parseISO(task.dueDate);
            switch(view) {
                case 'today':
                    return isToday(dueDate);
                case 'this-week':
                    return isThisWeek(dueDate);
                case 'project':
                    return task.project === (projectName || this.currentProject);
                case 'inbox':
                default:
                    return !task.project; // Only show tasks not assigned to any project
            }
        });
    }

    assignTaskToProject(taskId, projectName) {
        const task = this.data.tasks.find(t => t.id === taskId);
        if (task) {
            task.project = projectName;
            Storage.saveData(this.data);
        }
    }

    // New method to refresh the task list based on the currently active view
    refreshCurrentView() {
        let currentView = 'inbox'; // Default view
        let activeProjectName = null;

        // Check sidebar items for active class
        const activeSidebarItem = document.querySelector('.sidebar li.active');
        if (activeSidebarItem) {
            const view = activeSidebarItem.getAttribute('data-view');
            if (view) {
                currentView = view;
            }
        }

        // Check project list items for active class
        const activeProjectItem = document.querySelector('#projectList li.active');
        if (activeProjectItem) {
            activeProjectName = activeProjectItem.getAttribute('data-project-name');
            currentView = 'project'; // If a project is active, the view is 'project'
            this.currentProject = activeProjectName; // Ensure currentProject is set
        } else if (currentView !== 'project') {
             this.currentProject = null; // Reset if not a project view
        }
        
        console.log(`Refreshing view: ${currentView}, Project: ${this.currentProject}`);
        const tasksToRender = this.filterTasks(currentView, this.currentProject);
        this.ui.renderTasks(tasksToRender);
    }
} 