// data/projects.ts
import { Project } from "../types/index";




const projects: Project[] = [
  {
    id: "todo-list",
    title: "Todo List App",
    icon: "../../public/icons/win98/w98_directory_program_group.ico",
    description: "A simple todo list application with React and JavaScript",
    type: "interactive",
    technologies: ["React", "JavaScript", "CSS Modules"],
    repoUrl: "https://github.com/yourusername/todo-app",
    demoUrl: "https://todo-app.yourdomain.com",
    content: "This could be JSX for interactive demo",
    // Or component import for the actual interactive app
  },
  {
    id: "weather-app",
    title: "Weather App",
    icon: "/icons/weather-icon.png",
    description: "Weather application using OpenWeather API",
    type: "interactive",
    technologies: ["React", "Axios", "OpenWeather API"],
    repoUrl: "https://github.com/yourusername/weather-app",
    content: "Weather app implementation,",
  },
  {
    id: "about",
    title: "about",
    icon: "/icons/about-icon.png",
    description: "about me page",
    type: "visual",
    technologies: ["html", "css", "javascript"],
    repoUrl: "https://github.com/yourusername/weather-app",
    demoUrl: "",
    content: "",
  },
  {
    id: "ecommerce-platform",
    title: "E-commerce Platform",
    icon: "/icons/ecommerce-icon.png",
    description:
      "Complete e-commerce platform with product management, user authentication, and payment processing",
    type: "interactive",
    technologies: ["React", "MongoDB", "Tailwind CSS", "Node.js", "Express"],
    repoUrl: "https://github.com/miguelcardiga/ecommerce-platform",
    demoUrl: "https://mcnasty-studios.com",
    content:
      "Developed and managed a complete e-commerce platform for McNasty Studios, handling everything from design to implementation, using agile methodologies for efficient project management. Features include product catalog, shopping cart functionality, secure checkout process, user authentication, and admin dashboard for inventory management.",
  },
  {
    id: "nonprofit-website",
    title: "Non-Profit Website Overhaul",
    icon: "/icons/nonprofit-icon.png",
    description:
      "Comprehensive redesign of a mental health organization's website with donation optimization",
    type: "visual",
    technologies: ["React", "UX/UI", "CSS", "Responsive Design"],
    repoUrl: "https://github.com/miguelcardiga/northern-lights-website",
    demoUrl: "https://northern-lights.org",
    content:
      "Led a comprehensive redesign and optimization of a mental health organization's website, focusing on user experience and donation pathways, resulting in increased traffic and donor engagement. The project included improved navigation, mobile responsiveness, donation form optimization, and content restructuring to better highlight the organization's mission and impact.",
  },
  {
    id: "digital-marketing-campaigns",
    title: "Digital Marketing Campaigns",
    icon: "/icons/marketing-icon.png",
    description:
      "Strategic digital marketing campaigns across multiple platforms for various clients",
    type: "visual",
    technologies: ["Analytics", "SEO", "Social Media", "Content Marketing"],
    // repoUrl: "https://github.com/miguelcardiga/marketing-portfolio",
    demoUrl: "https://marketing-portfolio.miguelcardiga.com",
    content:
      "Created and executed digital marketing strategies for various clients across different industries, enhancing brand presence and significantly improving engagement metrics and conversion rates. The campaigns integrated SEO optimization, content strategy, social media management, and analytics tracking to deliver measurable results.",
  },
  {
    id: "python-text-game",
    title: "Python Text-Based Adventure Game",
    icon: "/icons/game-icon.png",
    description:
      "Interactive text-based adventure game with branching narrative paths",
    type: "interactive",
    technologies: ["Python", "Game Development", "CLI"],
    // repoUrl: "https://github.com/miguelcardiga/python-adventure-game",
    content:
      "Developed an interactive text-based adventure game using Python, implementing user input validation, game state management, and narrative branching logic. The game features multiple endings based on player choices, inventory management, and character development systems.",
  },
  {
    id: "video-campaign",
    title: "Non-Profit Video Campaign",
    icon: "/icons/video-icon.png",
    description: "Fundraising video campaign for mental health awareness",
    type: "visual",
    technologies: ["Video Production", "Digital Storytelling", "Fundraising"],
    // repoUrl: "https://github.com/miguelcardiga/fundraising-campaign",
    demoUrl: "https://vimeo.com/northernlights/campaign",
    content:
      "Directed a potent video campaign to elevate brand awareness, significantly boosting fundraising efforts and donor engagement for a mental health organisation. The campaign included a series of testimonial videos, animation explainers of mental health concepts, and call-to-action segments that directly led to increased donations.",
  },
  {
    id: "todo-list",
    title: "Todo List App",
    icon: "/icons/todo-icon.png",
    description: "A simple todo list application with React and TypeScript",
    type: "interactive",
    technologies: ["React", "TypeScript", "CSS Modules"],
    repoUrl: "https://github.com/yourusername/todo-app",
    demoUrl: "https://todo-app.yourdomain.com",
    content: "This could be JSX for interactive demo",
    // Or component import for the actual interactive app
  },
];

export default projects;
