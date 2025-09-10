import { DesktopFile, FileType } from "../types/fs";
import { StaticImageData } from "next/image";
import GameOfLifeWindow from "../components/content/GameOfLife";
import CV from "../components/content/cv";

export const contact = {
    email: 'contact@miguelcardiga.com',
    phone: '123-456-7890',
    location: 'Toronto, ON',
    linkedin: 'https://www.linkedin.com/in/miguel-cardiga-703378188/',
    github: 'https://github.com/Mcnsgit'
};

// --- Define Placeholder Images (Replace with actual imports or paths) ---
// const placeholderImg: StaticImageData = {
  // src: "/placeholder.jpg",
  // height: 230,
  // width: 360,
// }; // Example structure
// const project1Img: StaticImageData | string = "/placeholder.jpg"; // Example, adjust as needed
// const project2Img: StaticImageData | string = "/placeholder.jpg";
// const project3Img: StaticImageData | string = "/placeholder.jpg";
const project4Img: StaticImageData | string = "/placeholder.jpg";
// const videoCampaignImg: StaticImageData | string = "/placeholder.jpg";

export const portfolioProjects: DesktopFile[] = [
  {
    id: "kannybunny-kanban",
    name: "Kannybunny Kanban Board",
    icon: "/assets/icons/briefcase-0.png",
    type: FileType.PROJECT,
    x: 20,
    y: 20,
    data: {
      content:
        "A modern, intuitive task management application built with React and Material-UI. The main challenge was implementing a seamless drag-and-drop interface for tasks between columns, which was solved using react-beautiful-dnd. State management is handled with Redux Toolkit for a predictable and scalable architecture. Demo credentials - User: demo_user, Pass: demo123",
      description:
        "A modern, intuitive task management application built with React and Material-UI. The main challenge was implementing a seamless drag-and-drop interface for tasks between columns, which was solved using react-beautiful-dnd. State management is handled with Redux Toolkit for a predictable and scalable architecture. Demo credentials - User: demo_user, Pass: demo123",
      technologies: [
        "React",
        "Redux Toolkit",
        "Material-UI",
        "Node.js",
        "Express",
        "MongoDB",
      ],
      repoUrl: "https://github.com/Mcnsgit/kannybunny",
      demoUrl: "https://kannybunny.vercel.app/",
      url: "https://kannybunny.vercel.app/",
      image: "/assets/icons/screenshot.png",
    },
  },
  {
    id: "js-drum-kit",
    name: "JavaScript Drum Kit",
    icon: "/assets/icons/media_player_file-0.png",
    type: FileType.PROJECT,
    x: 20,
    y: 120,
    data: {
      content:
        "A simple and interactive drum kit built with vanilla JavaScript. The key challenge was to efficiently handle keyboard events to trigger drum sounds, which was achieved by mapping key codes to audio elements and using event listeners to play the corresponding sound.",
      description:
        "A simple and interactive drum kit built with vanilla JavaScript. The key challenge was to efficiently handle keyboard events to trigger drum sounds, which was achieved by mapping key codes to audio elements and using event listeners to play the corresponding sound.",
      technologies: ["JavaScript", "HTML", "CSS"],
      repoUrl: "https://github.com/Mcnsgit/js-dom-drumkit-challenge",
      demoUrl: "https://mcnsgit.github.io/js-dom-drumkit-challenge/",
      url: "https://mcnsgit.github.io/js-dom-drumkit-challenge/",
      image: "/assets/icons/screenshot.png",
    },
  },
  {
    id: "ambers-garden",
    name: "Amber's Garden",
    icon: "/assets/icons/world-5.png",
    type: FileType.PROJECT,
    x: 20,
    y: 220,
    data: {
      content:
        "An interactive web project, Amber's Garden, created using vanilla JavaScript, HTML, and CSS. This project focused on creating a visually engaging experience with DOM manipulation and CSS animations to bring the garden to life.",
      description:
        "An interactive web project, Amber's Garden, created using vanilla JavaScript, HTML, and CSS. This project focused on creating a visually engaging experience with DOM manipulation and CSS animations to bring the garden to life.",
      technologies: ["JavaScript", "HTML", "CSS"],
      repoUrl: "https://github.com/Mcnsgit/ambers_garden-indigo_projects",
      demoUrl: "https://mcnsgit.github.io/ambers_garden-indigo_projects/",
      url: "https://mcnsgit.github.io/ambers_garden-indigo_projects/",
      image: "/assets/icons/screenshot.png",
    },
  },
  {
    id: "todo-list-app",
    name: "Todo List App",
    icon: "/assets/icons/notepad_file-0.png",
    type: FileType.PROJECT,
    x: 120,
    y: 20,
    data: {
      content:
        "A classic Todo List application to manage tasks, built as an interactive component within the desktop environment. The main goal was to create a reusable React component with local state management for adding, deleting, and marking tasks as complete.",
      description:
        "A classic Todo List application to manage tasks, built as an interactive component within the desktop environment. The main goal was to create a reusable React component with local state management for adding, deleting, and marking tasks as complete.",
      technologies: ["React", "TypeScript", "SCSS"],
      repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
      image: "/assets/icons/screenshot.png",
    },
  },
  {
    id: "weather-app",
    name: "Weather App",
    icon: "/assets/icons/sun-0.png",
    type: FileType.PROJECT,
    x: 120,
    y: 120,
    data: {
      content:
        "A simple weather application that displays the current weather for a searched location. This is an interactive component within the desktop that fetches data from a third-party weather API and displays it to the user.",
      description:
        "A simple weather application that displays the current weather for a searched location. This is an interactive component within the desktop that fetches data from a third-party weather API and displays it to the user.",
      technologies: ["React", "TypeScript", "SCSS"],
      repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
      image: "/assets/icons/screenshot.png",
    },
  },
  {
    id: "python-text-game",
    name: "Python Text-Based Game",
    icon: "/assets/icons/joystick-5.png", // Corrected path
    type: FileType.PROJECT,
    x: 120,
    y: 120,
    data: {
      content:
        "Developed an interactive text-based adventure game using Python. The project involved creating a branching narrative, managing game state, and handling user input, providing a solid foundation in Python programming and game logic.",
      description:
        "Developed an interactive text-based adventure game using Python. The project involved creating a branching narrative, managing game state, and handling user input, providing a solid foundation in Python programming and game logic.",
      technologies: ["Python", "Game Development", "CLI"],
      repoUrl: "https://github.com/Mcnsgit/python-text-game",
      image: project4Img,
    },
  },
];
export const programFiles: DesktopFile[] = [
  {
    id: "gameoflife",
    name: "Conway's Game",
    icon: "/assets/icons/joystick-5.png",
    type: FileType.COMPONENT,
    x: 220,
    y: 20,
    data: { component: GameOfLifeWindow },
  },
  {
    id: "google",
    name: "Internet Browser",
    icon: "/assets/icons/internet_connection_wiz-4.png",
    type: FileType.IFRAME,
    x: 220,
    y: 120,
    data: { url: "https://www.google.com/webhp?igu=1" },
  },
];

export const desktopFiles: DesktopFile[] = [
  {
    id: "about",
    name: "About Me",
    icon: "/assets/icons/address_book_user.png",
    type: FileType.ABOUT,
    x: 320,
    y: 20,
    data: {},
  },
  {
    id: "contact",
    name: "Contact",
    icon: "/assets/icons/msn3-4.png",
    type: FileType.CONTACT,
    x: 320,
    y: 120,
    data: {},
  },
  {
    id: "education",
    name: "Education",
    icon: "/assets/icons/certificate_seal.png",
    type: FileType.EDUCATION,
    x: 320,
    y: 220,
    data: {},
  },
  {
    id: "settings",
    name: "Settings",
    icon: "/assets/icons/settings_gear-0.png",
    type: FileType.SETTINGS,
    x: 420,
    y: 20,
    data: {},
  },
  {
    id: "cv",
    name: "CV.doc",
    icon: "/assets/icons/file_lines-0.png",
    type: FileType.COMPONENT,
    x: 420,
    y: 120,
    data: { component: CV },
  },
  {
    id: "readme",
    name: "README.txt",
    icon: "/assets/icons/notepad_file-0.png",
    type: FileType.TEXT,
    x: 420,
    y: 220,
    data: {
      content:
        "This is a virtual Windows 98 desktop built with Next.js and TypeScript!",
    },
  },
  {
    id: "projects_folder",
    name: "My Projects",
    icon: "/assets/icons/directory_closed-1.png",
    type: FileType.FOLDER,
    x: 520,
    y: 20,
    data: {
      children: portfolioProjects,
    },
  },
  ...programFiles,
  {
    id: "todo-list-app",
    name: "Todo List",
    icon: "/assets/icons/checklist-1.png",
    type: FileType.TODO,
    x: 520,
    y: 120,
    data: {},
  },
  {
    id: "weather-app-widget",
    name: "Weather",
    icon: "/assets/icons/sun-0.png",
    type: FileType.WEATHER,
    x: 520,
    y: 220,
    data: {},
  },
  {
    id: "web-video-player",
    name: "Web Video",
    icon: "/assets/icons/camera-0.png",
    type: FileType.WEB_VIDEO,
    x: 520,
    y: 320,
    data: {},
  }
];

export const StartMenuItems: DesktopFile[] = [
  {
    id: "programs",
    name: "Programs",
    icon: "/assets/icons/W98_Directory_Program_Group.png",
    type: FileType.PROGRAM,
    x: 0,
    y: 0,
    data: { children: programFiles },
  },
  {
    id: "documents",
    name: "Documents",
    icon: "/assets/icons/Directory-Open-File-Mydocs-Cool-3.png",
    type: FileType.FOLDER,
    x: 0,
    y: 0,
    data: {
      children: [
        {
          id: "cv",
          name: "CV.doc",
          icon: "/assets/icons/file_lines-0.png",
          type: FileType.COMPONENT,
          x: 0,
          y: 0,
          data: { component: CV },
        },
        {
          id: "readme",
          name: "README.txt",
          icon: "/assets/icons/notepad_file-0.png",
          type: FileType.TEXT,
          x: 0,
          y: 0,
          data: {
            content:
              "This is a virtual Windows 98 desktop built with Next.js and TypeScript!",
          },
        },
      ],
    },
  },
  {
    id: "projects",
    name: "Projects",
    icon: "/assets/icons/W98_Directory_Program_Group.png",
    type: FileType.FOLDER,
    x: 0,
    y: 0,
    data: { children: portfolioProjects },
  },
  {
    id: "separator_1",
    name: "separator",
    icon: "",
    type: FileType.SEPARATOR,
    x: 0,
    y: 0,
    data: { separator: true },
  },
  {
    id: "settings",
    name: "Settings",
    icon: "/assets/icons/settings_gear-0.png",
    type: FileType.SETTINGS,
    x: 0,
    y: 0,
    data: {},
  },
];