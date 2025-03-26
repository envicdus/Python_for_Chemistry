// progress-tracker.js
const fs = require('fs');

/**
 * Generates a README with progress bars based on task status emojis
 * @param {Array} tasks - Array of task objects with name, status, and dateFinished properties
 * @returns {string} Markdown content for README
 */
function generateProgressReadme(tasks) {
  // Calculate overall progress
  let completedCount = 0;
  let inProgressCount = 0;
  let totalTasks = tasks.length;

  tasks.forEach(task => {
    if (task.status.includes("✅")) {
      completedCount++;
    } else if (task.status.includes("🟡")) {
      inProgressCount++;
    }
  });

  // Calculate overall percentage (completed tasks count as 100%, in-progress as 50%)
  const overallPercentage = Math.round((completedCount * 100 + inProgressCount * 50) / totalTasks);

  // Calculate category percentages
  const foundationalTasks = tasks.filter(task =>
    task.name.includes("Project Setup") ||
    task.name.includes("Landing Page") ||
    task.name.includes("Documentation") ||
    task.name.includes("Deployment")
  );

  const foundationalPercentage = calculateCategoryPercentage(foundationalTasks);

  const contentTasks = tasks.filter(task =>
    !isNaN(parseInt(task.name.charAt(0))) &&
    !task.name.includes("Tutorials") &&
    !task.name.includes("Testing")
  );

  const contentPercentage = calculateCategoryPercentage(contentTasks);

  const additionalTasks = tasks.filter(task =>
    task.name.includes("Tutorials") ||
    task.name.includes("Testing")
  );

  const additionalPercentage = calculateCategoryPercentage(additionalTasks);

  // Generate the markdown
  let markdown = `# Computational Chemistry Project Progress

## Legend
- ✅ Completed = 100%
- 🟡 In Progress = 50%
- 🔲 Not Started = 0%

## Project Status Overview
![progress](https://progress-bar.xyz/${overallPercentage}/)

## Tasks Status

| Main Section/Task | Status | Progress | Date Finished |
|-------------------|--------|----------|--------------|
`;

  // Add each task
  tasks.forEach(task => {
    const percentage = getTaskPercentage(task.status);
    markdown += `| ${task.name} | ${task.status} | ![progress](https://progress-bar.xyz/${percentage}/) | ${task.dateFinished || ''} |\n`;
  });

  markdown += `
## Progress by Category

### Core Content
![progress](https://progress-bar.xyz/${contentPercentage}/)
- ${countTasksByStatus(contentTasks, "✅")} section(s) completed
- ${countTasksByStatus(contentTasks, "🟡")} section(s) in progress
- ${countTasksByStatus(contentTasks, "🔲")} section(s) not started

### Foundational Elements
![progress](https://progress-bar.xyz/${foundationalPercentage}/)
- ${countTasksByStatus(foundationalTasks, "✅")} element(s) completed
- ${countTasksByStatus(foundationalTasks, "🟡")} element(s) in progress
- ${countTasksByStatus(foundationalTasks, "🔲")} element(s) not started

### Additional Materials
![progress](https://progress-bar.xyz/${additionalPercentage}/)
- ${countTasksByStatus(additionalTasks, "✅")} item(s) completed
- ${countTasksByStatus(additionalTasks, "🟡")} item(s) in progress
- ${countTasksByStatus(additionalTasks, "🔲")} item(s) not started

## Recent Updates
`;

  // Add recent updates
  const completedTasks = tasks.filter(task => task.status.includes("✅") && task.dateFinished);
  completedTasks.sort((a, b) => new Date(b.dateFinished) - new Date(a.dateFinished));

  const recentCompletedTasks = completedTasks.slice(0, 3);
  recentCompletedTasks.forEach(task => {
    markdown += `- ✅ Completed ${task.name} (${task.dateFinished})\n`;
  });

  const inProgressTasks = tasks.filter(task => task.status.includes("🟡"));
  inProgressTasks.forEach(task => {
    markdown += `- 🟡 Started work on ${task.name}\n`;
  });

  return markdown;
}

/**
 * Calculates percentage based on status emoji
 * @param {string} status - Status string containing emoji
 * @returns {number} Percentage value (0, 50, or 100)
 */
function getTaskPercentage(status) {
  if (status.includes("✅")) return 100;
  if (status.includes("🟡")) return 50;
  return 0;
}

/**
 * Calculates percentage completion for a category of tasks
 * @param {Array} tasks - Array of task objects
 * @returns {number} Percentage value (0-100)
 */
function calculateCategoryPercentage(tasks) {
  if (tasks.length === 0) return 0;

  let completedCount = 0;
  let inProgressCount = 0;

  tasks.forEach(task => {
    if (task.status.includes("✅")) {
      completedCount++;
    } else if (task.status.includes("🟡")) {
      inProgressCount++;
    }
  });

  return Math.round((completedCount * 100 + inProgressCount * 50) / tasks.length);
}

/**
 * Counts tasks with a specific status emoji
 * @param {Array} tasks - Array of task objects
 * @param {string} statusEmoji - Emoji to count
 * @returns {number} Count of tasks with matching status
 */
function countTasksByStatus(tasks, statusEmoji) {
  return tasks.filter(task => task.status.includes(statusEmoji)).length;
}

/**
 * Reads tasks from a JSON file
 * @param {string} filePath - Path to tasks JSON file
 * @returns {Array} Array of task objects
 */
function readTasksFromFile(filePath) {
  const rawData = fs.readFileSync(filePath);
  return JSON.parse(rawData);
}

/**
 * Writes README content to a file
 * @param {string} content - Markdown content
 * @param {string} filePath - Path to output README file
 */
function writeReadmeToFile(content, filePath) {
  fs.writeFileSync(filePath, content);
  console.log(`Progress README updated at ${filePath}`);
}

// Main function
function main() {
  // Read tasks from tasks.json file
  const tasks = readTasksFromFile('./tasks.json');

  // Generate the README content
  const readmeContent = generateProgressReadme(tasks);

  // Write to README file
  writeReadmeToFile(readmeContent, './README.md');
}

// Run the script
main();