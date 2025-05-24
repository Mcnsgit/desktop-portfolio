import { Project } from "../types"; // Ensure ProjectTag is exported from types
import { StaticImageData } from "next/image";
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
export const portfolioProjects: Project[] = [
  // --- Merge data from data/projects.ts ---
  {
    id: "todo-list",
    title: "Todo List App",
    name: "Todo List App",
    icon: "/assets/win98-icons/png/notepad_file-0.png", // Corrected path
    description: "A simple todo list application built with React",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "javascript", color: "green-text-gradient" },
      { name: "css", color: "pink-text-gradient" },
    ],
    image: placeholderImg, // Use placeholder or actual image
    technologies: ["React", "JavaScript", "CSS Modules"],
    repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
    source_code_link: "https://github.com/Mcnsgit/desktop-portfolio",
    content:
      "A functional Todo list application demonstrating state management and component interaction within the RetroOS environment.",
    type: "interactive",
  },
  {
    id: "weather-app",
    title: "Weather App",
    name: "Weather App",
    icon: "/assets/win98-icons/png/world-5.png", // Corrected path
    description: "Fetches and displays weather data using OpenWeather API",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "api", color: "green-text-gradient" },
    ],
    image: placeholderImg,
    technologies: ["React", "Axios", "OpenWeather API"],
    repoUrl: "https://github.com/Mcnsgit/desktop-portfolio",
    source_code_link: "https://github.com/Mcnsgit/desktop-portfolio",
    content:
      "Integrates with the OpenWeatherMap API to provide current weather conditions based on user input or detected location.",
    type: "interactive",
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    name: "E-commerce Platform",
    icon: "/assets/win98-icons/png/shopping_cart-1.png",
    description:
      "Managed full lifecycle of an e-commerce platform for McNasty Studios.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "mongodb", color: "green-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
      { name: "nodejs", color: "blue-text-gradient" },
      { name: "express", color: "green-text-gradient" },
    ],
    image: project1Img,
    technologies: ["React", "MongoDB", "Tailwind CSS", "Node.js", "Express"],
    repoUrl: "https://github.com/miguelcardiga/ecommerce-platform",
    source_code_link: "https://github.com/miguelcardiga/ecommerce-platform",
    demoUrl: "https://mcnasty-studios.com",
    live_link: "https://mcnasty-studios.com",
    content:
      "Developed and managed a complete e-commerce platform for McNasty Studios, handling everything from design to implementation, using agile methodologies. Features include product catalog, shopping cart, secure checkout, user auth, and admin dashboard.",
    type: "code",
  },
  {
    id: "nonprofit-website",
    title: "Non-Profit Website Overhaul",
    name: "Non-Profit Website Overhaul",
    icon: "/assets/win98-icons/png/internet_options-5.png", // Corrected path
    description:
      "Led redesign of a mental health organization's website, focusing on UX and donations.",
    tags: [
      { name: "react", color: "blue-text-gradient" },
      { name: "ux/ui", color: "green-text-gradient" },
      { name: "css", color: "pink-text-gradient" },
    ],
    image: project3Img,
    technologies: ["React", "UX/UI", "CSS", "Responsive Design"],
    repoUrl: "https://github.com/miguelcardiga/northern-lights-website",
    source_code_link:
      "https://github.com/miguelcardiga/northern-lights-website",
    demoUrl: "https://northern-lights.org",
    live_link: "https://northern-lights.org",
    content:
      "Led comprehensive redesign focusing on user experience and donation pathways, resulting in increased traffic and engagement. Included improved navigation, mobile responsiveness, optimized forms, and content restructuring.",
    type: "visual",
  },
  {
    id: "digital-marketing-campaigns",
    title: "Digital Marketing Campaigns",
    name: "Digital Marketing Campaigns",
    icon: "/assets/win98-icons/png/media_player_file-0.png", // Corrected path
    description:
      "Executed digital marketing strategies, enhancing brand presence and conversion rates.",
    tags: [
      { name: "analytics", color: "blue-text-gradient" },
      { name: "seo", color: "green-text-gradient" },
      { name: "socialmedia", color: "pink-text-gradient" },
    ],
    image: project2Img,
    technologies: ["Analytics", "SEO", "Social Media", "Content Marketing"],
    source_code_link: undefined,
    demoUrl: "https://marketing-portfolio.miguelcardiga.com",
    live_link: "https://marketing-portfolio.miguelcardiga.com",
    content:
      "Created and executed strategies integrating SEO, content, social media, and analytics for measurable results across various client industries.",
    type: "visual",
  },
  {
    id: "python-text-game",
    title: "Python Text-Based Adventure",
    name: "Python Text-Based Game",
    icon: "/assets/win98-icons/png/joystick-5.png", // Corrected path
    description:
      "Developed an interactive text-based adventure game using Python.",
    tags: [
      { name: "python", color: "blue-text-gradient" },
      { name: "game-dev", color: "green-text-gradient" },
      { name: "cli", color: "pink-text-gradient" },
    ],
    image: project4Img,
    technologies: ["Python", "Game Development", "CLI"],
    source_code_link: undefined, // Add link if available
    demoUrl: undefined,
    live_link: undefined,
    content:
      "Developed an interactive text-based adventure game using Python, implementing input validation, state management, and narrative branching. Features multiple endings, inventory, and character systems.",
    type: "code",
  },
  {
    id: "video-campaign",
    title: "Non-Profit Video Campaign",
    name: "Non-Profit Video Campaign",
    icon: "/assets/win98-icons/png/video_mk-5.png", // Corrected path
    description:
      "Directed fundraising video campaign for mental health awareness.",
    tags: [
      { name: "video", color: "blue-text-gradient" },
      { name: "fundraising", color: "green-text-gradient" },
      { name: "nonprofit", color: "pink-text-gradient" },
    ],
    image: videoCampaignImg,
    technologies: ["Video Production", "Digital Storytelling", "Fundraising"],
    source_code_link: undefined,
    demoUrl: "https://vimeo.com/northernlights/campaign",
    live_link: "https://vimeo.com/northernlights/campaign",
    content:
      "Directed a potent video campaign including testimonials, explainers, and CTAs, significantly boosting fundraising efforts and donor engagement for a mental health organisation.",
    type: "visual",
  },
];
