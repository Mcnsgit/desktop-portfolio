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
          (project.technologies ?? []).map((tech) => `- ${tech}`).join("\n")
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



// // Write file content
// export function writeFileContent(path: string, content: string) {
//   try {
//     // Ensure parent directory exists
//     const parentDir = path.substring(0, path.lastIndexOf("/"));
//     if (parentDir && !fs.existsSync(parentDir)) {
//       fs.mkdirSync(parentDir, { recursive: true });
//     }
//     fs.writeFileSync(path, content);
//     return true;
//   } catch (error) {
//     console.error(`Error writing file ${path}:`, error);
//     return false;
//   }
// }

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



// Create a shortcut (simple .lnk file with the target path)
export function createShortcut(path: string, target: string) {
  try {
    fs.writeFileSync(path, target);
    return true;
  } catch (error) {
    console.error(`Error creating shortcut ${path} to ${target}:`, error);
    return false;
  }
}// In-memory file system for demo purposes
const fileSystem = new Map<string, string>();

/**
 * Read file content from in-memory file system
 * @param path The file path to read
 * @returns File content or null if file doesn't exist
 */
export const readFileContent = (path: string): string | null => {
  try {
    if (fileSystem.has(path)) {
      return fileSystem.get(path) || null;
    }
    
    // For demo purposes, return some default content for new files
    const extension = path.split('.').pop()?.toLowerCase();
    let defaultContent = '';
    
    switch (extension) {
      case 'txt':
        defaultContent = 'This is a text file.';
        break;
      case 'md':
        defaultContent = '# Markdown File\n\nThis is a markdown file.';
        break;
      case 'html':
        defaultContent = '<!DOCTYPE html>\n<html>\n<head>\n  <title>HTML File</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>';
        break;
      case 'js':
      case 'ts':
        defaultContent = '// JavaScript/TypeScript File\n\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("World"));';
        break;
      case 'css':
        defaultContent = '/* CSS File */\n\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}';
        break;
      default:
        defaultContent = '';
    }
    
    // Store default content in file system
    fileSystem.set(path, defaultContent);
    return defaultContent;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
};

/**
 * Write content to in-memory file system
 * @param path The file path to write to
 * @param content The content to write
 * @returns True if successful, false otherwise
 */
export const writeFileContent = (path: string, content: string): boolean => {
  try {
    fileSystem.set(path, content);
    return true;
  } catch (error) {
    console.error('Error writing file:', error);
    return false;
  }
};

/**
 * Delete file from in-memory file system
 * @param path The file path to delete
 * @returns True if successful, false otherwise
 */
export const deleteFile = (path: string): boolean => {
  try {
    if (fileSystem.has(path)) {
      fileSystem.delete(path);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};



/**
 * List files in a directory (dummy implementation)
 * @param path The directory path to list
 * @returns Array of file paths in the directory
 */
export const listDirectory = (path: string): string[] => {
  // This is a dummy implementation that returns hardcoded paths
  // based on the directory requested
  
  if (path === '/') {
    return ['/home', '/projects', '/documents'];
  } else if (path === '/home') {
    return ['/home/user', '/home/documents', '/home/pictures'];
  } else if (path === '/projects') {
    return ['/projects/project1', '/projects/project2', '/projects/project3'];
  } else if (path === '/documents') {
    return ['/documents/document1.txt', '/documents/document2.md', '/documents/document3.html'];
  }
  
  return [];
};

/**
 * Copy a file
 * @param sourcePath Source file path
 * @param destinationPath Destination file path
 * @returns True if successful, false otherwise
 */
export const copyFile = (sourcePath: string, destinationPath: string): boolean => {
  try {
    const content = readFileContent(sourcePath);
    if (content !== null) {
      return writeFileContent(destinationPath, content);
    }
    return false;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

/**
 * Move a file (copy and delete)
 * @param sourcePath Source file path
 * @param destinationPath Destination file path
 * @returns True if successful, false otherwise
 */
export const moveFile = (sourcePath: string, destinationPath: string): boolean => {
  try {
    const copySuccessful = copyFile(sourcePath, destinationPath);
    if (copySuccessful) {
      return deleteFile(sourcePath);
    }
    return false;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

/**
 * Get file stats
 * @param path The file path
 * @returns Object with file stats
 */
export const getFileStats = (path: string): { exists: boolean, size: number, modified: Date } => {
  const content = fileSystem.get(path);
  if (content) {
    return {
      exists: true,
      size: content.length,
      modified: new Date(),
    };
  }
  
  return {
    exists: false,
    size: 0,
    modified: new Date(),
  };
};
// Export the initialized filesystem
export { fs };
