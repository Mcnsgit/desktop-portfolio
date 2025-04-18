import { ProjectTag, Project } from "../types/index";
import {
  DigitalMediaPJ,
  VideoCampaing,
  ToDo,
  Ecommerce,
  Weather,
  Website,
  Phone,
  Game,
} from "../../public/assets/win98-icons";
const projects: Project[] = [
  {
    id: "todo-list",
    title: "Todo List App",
    icon: "/assets/win98-icons/icons/png/notepad_file-0.png",
    description: "A simple todo list application with React and JavaScript",
    tags: [
      { name: "JavaScript", color: "yellow" },
      { name: "project", color: "blue" },
    ],
    technologies: ["React", "JavaScript", "CSS Modules"],
    repoUrl: "https://github.com/yourusername/todo-app",
    demoUrl: "https://todo-app.yourdomain.com",
    content: "This could be JSX for interactive demo",
    name: "",
    image: ""
  },
  {
    id: "weather-app",
    title: "Weather App",
    icon: "/assets/win98-icons/icons/png/world-5.png",
    description: "Weather application using OpenWeather API",
    tags: [
      { name: "React", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["React", "Axios", "OpenWeather API"],
    repoUrl: "https://github.com/yourusername/weather-app",
    content: "Weather app implementation,",
    name: "",
    image: ""
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    icon: "/assets/win98-icons/icons/png/html-5.png",
    description: "Complete e-commerce platform with product management, user authentication, and payment processing",
    tags: [
      { name: "React", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["React", "MongoDB", "Tailwind CSS", "Node.js", "Express"],
    repoUrl: "https://github.com/miguelcardiga/ecommerce-platform",
    demoUrl: "https://mcnasty-studios.com",
    content: "Developed and managed a complete e-commerce platform for McNasty Studios, handling everything from design to implementation, using agile methodologies for efficient project management. Features include product catalog, shopping cart functionality, secure checkout process, user authentication, and admin dashboard for inventory management.",
    name: "",
    image: ""
  },
  {
    id: "nonprofit-website",
    title: "Non-Profit Website Overhaul",
    icon: "/assets/win98-icons/icons/png/internet_options-5.png",
    description: "Comprehensive redesign of a mental health organization's website with donation optimization",
    tags: [
      { name: "React", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["React", "UX/UI", "CSS", "Responsive Design"],
    repoUrl: "https://github.com/miguelcardiga/northern-lights-website",
    demoUrl: "https://northern-lights.org",
    content: "Led a comprehensive redesign and optimization of a mental health organization's website, focusing on user experience and donation pathways, resulting in increased traffic and donor engagement. The project included improved navigation, mobile responsiveness, donation form optimization, and content restructuring to better highlight the organization's mission and impact.",
    name: "",
    image: ""
  },
  {
    id: "digital-marketing-campaigns",
    title: "Digital Marketing Campaigns",
    icon: "/assets/win98-icons/icons/png/media_player_file-0.png",
    description: "Strategic digital marketing campaigns across multiple platforms for various clients",
    tags: [
      { name: "React", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["Analytics", "SEO", "Social Media", "Content Marketing"],
    demoUrl: "https://marketing-portfolio.miguelcardiga.com",
    content: "Created and executed digital marketing strategies for various clients across different industries, enhancing brand presence and significantly improving engagement metrics and conversion rates. The campaigns integrated SEO optimization, content strategy, social media management, and analytics tracking to deliver measurable results.",
    name: "",
    image: ""
  },
  {
    id: "python-text-game",
    title: "Python Text-Based Adventure Game",
    icon: "/assets/win98-icons/icons/png/joystick-5.png",
    description: "Interactive text-based adventure game with branching narrative paths",
    tags: [
      { name: "Python", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["Python", "Game Development", "CLI"],
    content: "Developed an interactive text-based adventure game using Python, implementing user input validation, game state management, and narrative branching logic. The game features multiple endings based on player choices, inventory management, and character development systems.",
    name: "",
    image: ""
  },
  {
    id: "video-campaign",
    title: "Non-Profit Video Campaign",
    icon: "/assets/win98-icons/icons/png/video_mk-5.png",
    description: "Fundraising video campaign for mental health awareness",
    tags: [
      { name: "Video Production", color: "blue" },
      { name: "project", color: "green" },
    ],
    technologies: ["Video Production", "Digital Storytelling", "Fundraising"],
    demoUrl: "https://vimeo.com/northernlights/campaign",
    content: "Directed a potent video campaign to elevate brand awareness, significantly boosting fundraising efforts and donor engagement for a mental health organisation. The campaign included a series of testimonial videos, animation explainers of mental health concepts, and call-to-action segments that directly led to increased donations.",
    name: "",
    image: ""
  },
];
export default projects;
