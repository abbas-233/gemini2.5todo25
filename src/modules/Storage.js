// Storage.js - Handles all localStorage operations
import Task from './Task';

export default class Storage {
    static saveData(data) {
        // Log the data being saved, especially task priorities
        console.log("Saving data:", JSON.stringify(data, (key, value) => key === 'tasks' ? value.map(t => ({id: t.id, priority: t.priority})) : value));
        localStorage.setItem('todoAppData', JSON.stringify(data));
    }

    static loadData() {
        const savedData = localStorage.getItem('todoAppData');
        console.log("Raw data loaded from localStorage:", savedData);
        if (savedData) {
            try { // Add try-catch for parsing robustness
                const parsedData = JSON.parse(savedData);
                console.log("Parsed data:", parsedData);

                // Basic validation of parsed data structure
                if (!parsedData || !Array.isArray(parsedData.tasks) || !Array.isArray(parsedData.projects)) {
                     console.error("Invalid data structure in localStorage. Resetting.");
                     return { tasks: [], projects: [] };
                }

                // Reconstruct Task objects ensuring all properties are directly assigned
                parsedData.tasks = parsedData.tasks.map(taskData => {
                    // Validate essential task data fields
                    if (!taskData || typeof taskData.text !== 'string' || !taskData.id || !taskData.dueDate) {
                        console.warn("Skipping invalid task data:", taskData);
                        return null; // Indicate invalid task to be filtered out
                    }

                    // Log priority from raw taskData before creating Task object
                    console.log(`Processing taskData ${taskData.id}, Priority in raw data:`, taskData.priority);

                    // Create task instance using constructor for basic setup/methods
                    // Pass only essential arguments needed by the constructor logic itself
                    const task = new Task(taskData.text, taskData.dueDate);

                    // Explicitly assign ALL properties from saved data, overriding constructor defaults
                    task.id = taskData.id;
                    // Use saved priority or default, ensure it's one of the valid values
                    const validPriorities = ['low', 'medium', 'high'];
                    task.priority = validPriorities.includes(taskData.priority) ? taskData.priority : 'medium';
                    task.completed = !!taskData.completed;        // Ensure boolean value
                    task.project = taskData.project || null;      // Assign project or null
                    task.description = taskData.description || ''; // Load description or default to empty string

                    // Log the final priority assigned to the task object
                    console.log(`Final priority for task ${task.id} after loading:`, task.priority);

                    return task;
                }).filter(task => task !== null); // Filter out any null entries from invalid data

                 console.log("Reconstructed tasks:", parsedData.tasks);
                return parsedData;

            } catch (error) {
                console.error("Failed to parse or process data from localStorage:", error);
                // Optionally clear corrupted data
                // localStorage.removeItem('todoAppData');
                return { tasks: [], projects: [] }; // Return default structure on error
            }
        }
        // Return default structure if no saved data exists
        console.log("No saved data found, returning default structure.");
        return { tasks: [], projects: [] };
    }
} 