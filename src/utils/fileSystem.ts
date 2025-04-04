// src/utils/fileSystem.ts
import { configure, fs, InMemory } from "@zenfs/core";
import projects from "../data/project";

const directoryStructure = [
  "/home",
  "/home/guest",
  "/home/guest/Desktop",
  "/home/guest/Documents",
  "/home/guest/Pictures",
  "/projects",
  "/system",
  "/system/icons",
  "/system/wallpapers",
  "/tmp",
];

export async function initFileSystem(useLocalStorage = false) {
  try {
    // Configure ZenFS based on whether we want persistence or not
    if (useLocalStorage) {
      await configure({
        mounts: {
          "/": InMemory, // Using InMemory for now to fix TypeScript error
          "/tmp": InMemory,
        },
        addDevices: true,
      });
    } else {
      await configure({
        mounts: {
          "/": InMemory,
        },
        addDevices: true,
      });
    }
    createDirectoryStructure();
    return fs;
  } catch (error) {
    console.error("Failed to initialize file system", error);
    await configure({ mounts: { "/": InMemory } });
    return fs;
  }
}

// Creating directory structure
function createDirectoryStructure() {
  // Create root directories
  for (const dir of directoryStructure) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export async function loadDefaultFiles() {
  // Create a readme file in the home directory
  const readmePath = "/home/guest/README.txt";
  if (!fs.existsSync(readmePath)) {
    fs.writeFileSync(
      readmePath,
      "Welcome to RetroOS!\n\n" +
        "This is your personal workspace where you can explore projects and create your own files.\n" +
        "Use the File Explorer to browse and manage files, or try the Text Editor to create new documents.\n\n" +
        "Note: Files created in guest mode will not be saved permanently unless you toggle persistence in the settings."
    );
  }

  createShortcuts();
  createProjectFiles();
}

// Create desktop shortcuts
function createShortcuts() {
  const desktopPath = "/home/guest/Desktop";

  // Create My Projects shortcut
  if (!fs.existsSync(`${desktopPath}/My Projects.lnk`)) {
    fs.writeFileSync(`${desktopPath}/My Projects.lnk`, "/projects");
  }

  // Create My Documents shortcut
  if (!fs.existsSync(`${desktopPath}/My Documents.lnk`)) {
    fs.writeFileSync(
      `${desktopPath}/My Documents.lnk`,
      "/home/guest/Documents"
    );
  }

  // Create Text Editor shortcut
  if (!fs.existsSync(`${desktopPath}/Text Editor.lnk`)) {
    fs.writeFileSync(`${desktopPath}/Text Editor.lnk`, "app:texteditor");
  }
}

// Create project files based on project data
function createProjectFiles() {
  // Create folders for each project
  projects.forEach((project) => {
    const projectFolder = `/projects/${project.id}`;

    // Create project folder if it doesn't exist
    if (!fs.existsSync(projectFolder)) {
      fs.mkdirSync(projectFolder, { recursive: true });

      // Create README.md with project description
      fs.writeFileSync(
        `${projectFolder}/README.md`,
        `# ${project.title}\n\n` +
          `${project.description}\n\n` +
          `## Technologies\n\n` +
          project.technologies.map((tech) => `- ${tech}`).join("\n")
      );

      // Create sample files based on project type
      createSampleProjectFiles(project);
    }
  });
}

// Create sample files based on project type
function createSampleProjectFiles(project: any) {
  const projectFolder = `/projects/${project.id}`;

  switch (project.type) {
    case "code":
      // Create sample code files
      fs.writeFileSync(
        `${projectFolder}/index.html`,
        `<!DOCTYPE html>\n<html>\n<head>\n  <title>${project.title}</title>\n  <link rel="stylesheet" href="styles.css">\n</head>\n<body>\n  <h1>${project.title}</h1>\n  <div id="app"></div>\n  <script src="app.js"></script>\n</body>\n</html>`
      );

      fs.writeFileSync(
        `${projectFolder}/styles.css`,
        `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n  background-color: #f5f5f5;\n}\n\nh1 {\n  color: #333;\n}`
      );

      fs.writeFileSync(
        `${projectFolder}/app.js`,
        `// ${project.title} Application\n\ndocument.addEventListener('DOMContentLoaded', function() {\n  console.log('${project.title} initialized');\n  // Initialize application\n});\n`
      );
      break;

    case "interactive":
      // Create interactive demo files
      fs.writeFileSync(
        `${projectFolder}/index.html`,
        `<!DOCTYPE html>\n<html>\n<head>\n  <title>${project.title} Demo</title>\n  <link rel="stylesheet" href="demo.css">\n</head>\n<body>\n  <h1>${project.title} Interactive Demo</h1>\n  <div class="demo-container">\n    <div id="interactive-demo"></div>\n    <div class="controls">\n      <button id="start-demo">Start Demo</button>\n      <button id="reset-demo">Reset</button>\n    </div>\n  </div>\n  <script src="demo.js"></script>\n</body>\n</html>`
      );

      fs.writeFileSync(
        `${projectFolder}/demo.css`,
        `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\n.demo-container {\n  border: 1px solid #ccc;\n  padding: 20px;\n  border-radius: 5px;\n}\n\n.controls {\n  margin-top: 20px;\n  display: flex;\n  gap: 10px;\n}\n\nbutton {\n  padding: 8px 16px;\n  background-color: #0078d7;\n  color: white;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}\n\nbutton:hover {\n  background-color: #0063b1;\n}`
      );

      fs.writeFileSync(
        `${projectFolder}/demo.js`,
        `// ${project.title} Interactive Demo\n\ndocument.getElementById('start-demo').addEventListener('click', function() {\n  console.log('Starting demo...');\n  // Demo initialization logic\n});\n\ndocument.getElementById('reset-demo').addEventListener('click', function() {\n  console.log('Resetting demo...');\n  // Reset demo logic\n});\n`
      );
      break;

    case "visual":
      // Create files for visual projects
      fs.writeFileSync(
        `${projectFolder}/overview.md`,
        `# ${project.title} Visual Overview\n\n` +
          `${project.description}\n\n` +
          `## Screenshots\n\n` +
          `- screenshot1.png: Main page\n` +
          `- screenshot2.png: Features page\n` +
          `- screenshot3.png: Mobile view\n\n` +
          `## Design Elements\n\n` +
          `The design focuses on ${project.technologies.join(
            ", "
          )} with an emphasis on user experience and accessibility.`
      );

      // Create placeholder for screenshots
      fs.mkdirSync(`${projectFolder}/screenshots`, { recursive: true });
      fs.writeFileSync(
        `${projectFolder}/screenshots/PLACEHOLDER.txt`,
        `This folder would contain screenshots of the ${project.title} project.`
      );
      break;

    default:
      // Default project files
      fs.writeFileSync(
        `${projectFolder}/notes.txt`,
        `${project.title}\n` +
          `=================\n\n` +
          `${project.description}\n\n` +
          `Technologies used: ${project.technologies.join(", ")}\n\n` +
          `This file contains notes about the project.`
      );
  }
}

// Utility function to list files in a directory
export function listFiles(path: string) {
  try {
    return fs.readdirSync(path).map((name) => {
      const fullPath = `${path}/${name}`.replace(/\/\//g, "/");
      let isLink = false;
      let linkTarget = "";
      try {
        const stats = fs.lstatSync(fullPath);
        isLink = stats.isSymbolicLink();
        if (isLink) {
          linkTarget = fs.readlinkSync(fullPath).toString();
        }
      } catch (error) {
        console.warn(`Error checking link status for ${fullPath}:`, error);
      }
      if (name.endsWith(".lnk")) {
        isLink = true;
        try {
          // Fix: Convert Buffer to string using toString()
          const content = fs.readFileSync(fullPath);
          linkTarget = content.toString("utf8");
        } catch (error) {
          console.warn(`Error reading shortcut ${fullPath}:`, error);
        }
      }
      // Return an object or value as needed
      return { name, isLink, linkTarget };
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return [];
  }
}

// Read file content
export function readFileContent(path: string) {
  try {
    // Check if it's a .lnk file (shortcut)
    if (path.endsWith(".lnk")) {
      // Fix: Convert Buffer to string using toString()
      const content = fs.readFileSync(path);
      return content.toString("utf8");
    }

    // Fix: Convert Buffer to string using toString()
    const content = fs.readFileSync(path);
    return content.toString("utf8");
  } catch (error) {
    console.error(`Error reading file ${path}:`, error);
    return null;
  }
}

// Write file content
export function writeFileContent(path: string, content: string) {
  try {
    // Ensure parent directory exists
    const parentDir = path.substring(0, path.lastIndexOf("/"));
    if (parentDir && !fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(path, content);
    return true;
  } catch (error) {
    console.error(`Error writing file ${path}:`, error);
    return false;
  }
}

// Delete file or directory
export function deleteFileOrDir(path: string) {
  try {
    const stats = fs.statSync(path);
    if (stats.isDirectory()) {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
    return true;
  } catch (error) {
    console.error(`Error deleting ${path}:`, error);
    return false;
  }
}

// Create a new directory
export function createDirectory(path: string) {
  try {
    fs.mkdirSync(path, { recursive: true });
    return true;
  } catch (error) {
    console.error(`Error creating directory ${path}:`, error);
    return false;
  }
}

// Rename a file or directory
export function renameFileOrDir(oldPath: string, newPath: string) {
  try {
    fs.renameSync(oldPath, newPath);
    return true;
  } catch (error) {
    console.error(`Error renaming ${oldPath} to ${newPath}:`, error);
    return false;
  }
}

// Get file stats
export function getFileStats(path: string) {
  try {
    return fs.statSync(path);
  } catch (error) {
    console.error(`Error getting stats for ${path}:`, error);
    return null;
  }
}

// Create a shortcut (simple .lnk file with the target path)
export function createShortcut(path: string, target: string) {
  try {
    fs.writeFileSync(path, target);
    return true;
  } catch (error) {
    console.error(`Error creating shortcut ${path} to ${target}:`, error);
    return false;
  }
}

// Export the initialized filesystem
export { fs };
