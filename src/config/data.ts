import { DesktopFile, FileType } from "../types/fs";
import { StaticImageData } from "next/image";
import GameOfLife from "../components/content/GameOfLife";
import CV from "../components/content/cv";

export const contact = {
    email: 'contact@miguelcardiga.com',
    phone: '123-456-7890',
    location: 'Toronto, ON',
    linkedin: 'https://www.linkedin.com/in/miguel-cardiga-703378188/',
    github: 'https://github.com/Mcnsgit'
};

// --- Define Placeholder Images (Replace with actual imports or paths) ---
const placeholderImg: StaticImageData = {
  src: "/placeholder.jpg",
  height: 230,
  width: 360,
}; // Example structure
const project1Img: StaticImageData | string = "/placeholder.jpg"; // Example, adjust as needed
const project2Img: StaticImageData | string = "/placeholder.jpg";
const project3Img: StaticImageData | string = "/placeholder.jpg";
const project4Img: StaticImageData | string = "/placeholder.jpg";
const videoCampaignImg: StaticImageData | string = "/placeholder.jpg";

export const portfolioProjects: DesktopFile[] = [
  // --- Merge data from data/projects.ts ---
  {
    id: "todo-list",
    name: "Todo List App",
    icon: "/assets/icons/notepad_file-0.png", // Corrected path
    type: FileType.PROJECT,
    x: 20,
    y: 20,
    data: {
      content: "A simple todo list application built with React",
      technologies: ["React", "JavaScript", "CSS Modules"],
      repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
      image: placeholderImg, // Use placeholder or actual image
      demoUrl: "https://miguelcardiga.com",
      url: "https://miguelcardiga.com",
    },
  },
  {
    id: "weather-app",

    name: "Weather App",
    icon: "/assets/icons/world-5.png", // Corrected path
    type: FileType.PROJECT,
    x: 20,
    y: 120,
    data: {
      content: "Fetches and displays weather data using OpenWeather API",
      technologies: ["React", "Axios", "OpenWeather API"],
      repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
      image: placeholderImg,
    },
  },
  {
    id: "ecommerce-platform",
    name: "E-commerce Platform",
    icon: "/assets/icons/shopping_cart-1.png",
    type: FileType.PROJECT,
    x: 20,
    y: 220,
    data: {
      content:
        "Managed full lifecycle of an e-commerce platform for McNasty Studios.",
      technologies: ["React", "MongoDB", "Tailwind CSS", "Node.js", "Express"],
      repoUrl: "https://github.com/miguelcardiga/ecommerce-platform",
      image: project1Img,
    },
  },
  {
    id: "nonprofit-website",
    name: "Non-Profit Website Overhaul",
    icon: "/assets/icons/internet_connection_wiz-4.png", // Corrected path
    type: FileType.PROJECT,
    x: 20,
    y: 320,
    data: {
      content:
        "Led redesign of a mental health organization's website, focusing on UX and donations.",
      technologies: ["React", "UX/UI", "CSS", "Responsive Design"],
      repoUrl: "https://github.com/miguelcardiga/northern-lights-website",
      demoUrl: "https://northern-lights.org",
      image: project3Img,
    },
  },
  {
    id: "digital-marketing-campaigns",
    name: "Digital Marketing Campaigns",
    icon: "/assets/icons/media_player_file-0.png", // Corrected path
    type: FileType.PROJECT,
    x: 120,
    y: 20,
    data: {
      content:
        "Executed digital marketing strategies, enhancing brand presence and conversion rates.",
      technologies: ["Analytics", "SEO", "Social Media", "Content Marketing"],
      repoUrl: "https://github.com/miguelcardiga/marketing-portfolio",
      image: project2Img,
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
        "Developed an interactive text-based adventure game using Python.",
      technologies: ["Python", "Game Development", "CLI"],
      repoUrl: "https://github.com/miguelcardiga/python-text-game",
      image: project4Img,
    },
  },
  {
    id: "video-campaign",
    name: "Non-Profit Video Campaign",
    icon: "/assets/icons/video_mk-5.png", // Corrected path
    type: FileType.PROJECT,
    x: 120,
    y: 220,
    data: {
      content:
        "Directed fundraising video campaign for mental health awareness.",
      technologies: ["Video Production", "Digital Storytelling", "Fundraising"],
      repoUrl: "https://github.com/miguelcardiga/video-campaign",
      image: videoCampaignImg,
      url: "https://vimeo.com/northernlights/campaign",
      demoUrl: "https://vimeo.com/northernlights/campaign",
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
    data: { component: GameOfLife },
  },
  {
    id: "google",
    name: "Internet Browser",
    icon: "/assets/icons/world-5.png",
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
  ...portfolioProjects,
  ...programFiles,
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