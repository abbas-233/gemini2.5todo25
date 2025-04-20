// Project.js - Project class and related operations

export default class Project {
    constructor(name) {
        this.id = Date.now().toString();
        this.name = name;
    }

    static createProjectElement(project, onClick) {
        const li = document.createElement('li');
        li.textContent = project.name;
        li.setAttribute('data-project-name', project.name);
        li.setAttribute('data-id', project.id);
        li.addEventListener('click', () => onClick(project));
        return li;
    }
} 