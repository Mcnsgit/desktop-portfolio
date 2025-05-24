import {
  mobile,
  backend,
  creator,
  web,
  javascript,
  python,
  html,
  css,
  reactjs,
  redux,
  tailwind,
  nodejs,
  mongodb,
  git,
  figma,
  docker,
  shopify,
 
  threejs,
} from "../../public/assets";
import { StaticImageData } from "next/image";
// Navigation links
export const navLinks = [
  {
    id: "about",
    title: "About",
  },
  {
    id: "skills",
    title: "Skills",
  },
  {
    id: "experience",
    title: "Experience",
  },
  {
    id: "education",
    title: "Education",
  },
  {
    id: "projects",
    title: "Projects",
  },
  {
    id: "contact",
    title: "Contact",
  },
];


// Services offered
export const services: Array<{
  title: string;
  icon: StaticImageData | string;
  description?: string;
}> = [
  // Added explicit type
  {
    title: "Web Developer",
    icon: web,
    description: "Building responsive, high-performance web applications using modern technologies and best practices.",
  },
  {
    title: "React Developer",
    icon: mobile,
    description: "Crafting dynamic user interfaces with React, creating engaging and interactive user experiences.",
  },
  {
    title: "Backend Developer",
    icon: backend,
    description: "Designing robust server-side applications and APIs for scalable and efficient data management.",
  },
  {
    title: "Digital Marketer",
    icon: creator,
    description: "Developing strategic marketing campaigns that drive engagement and enhance brand visibility.",
  },
];
// Technologies skillset
export const technologies: Array<{ name: string; icon: StaticImageData | string }> = [ // Added explicit type
    { name: "HTML 5", icon: html }, { name: "CSS 3", icon: css },
    { name: "JavaScript", icon: javascript }, { name: "Python", icon: python },
    { name: "React JS", icon: reactjs }, { name: "Redux Toolkit", icon: redux },
    { name: "Tailwind CSS", icon: tailwind }, { name: "Node JS", icon: nodejs },
    { name: "MongoDB", icon: mongodb }, { name: "Three JS", icon: threejs },
    { name: "Git", icon: git }, { name: "Figma", icon: figma },
    { name: "Docker", icon: docker },
];
// Work experience
export const experiences: Array<{
  title: string;
  company_name: string;
  icon: StaticImageData | string;
  iconBg: string;
  date: string;
  points: string[];
}> = [
  {
    title: "Digital Marketer and Web Developer Freelancer",
    company_name: "Various Clients",
    icon: web,
    iconBg: "#383E56",
    date: "2020 - Present",
    points: [
      "Spearheaded a variety of digital marketing campaigns, substantially enhancing brand presence and engagement across multiple platforms for a diverse client base.",
      "Improved user experiences and search engine optimisation, ensured mobile responsiveness, and elevated site performance and user satisfaction.",
      "Showcased flexibility by meeting unique industry demands.",
      "Developed and maintained websites for SMEs.",
    ],
  },
  {
    title: "Founder and Creative Director",
    company_name: "McNasty Studios",
    icon: shopify,
    iconBg: "#E6DEDD",
    date: "May 2021 - Nov 2023",
    points: [
      "Pioneered the launch and managed an e-commerce platform, utilising agile methodologies to improve project management and delivery.",
      "Oversaw the entire project lifecycle from concept to successful launch.",
      "Managed development and marketing of a unique brand identity.",
      "Applied technical and creative skills to deliver high-quality digital products.",
    ],
  },
  {
    title: "Volunteer Non-Profit Digital Fundraising and Video Project Lead",
    company_name: "Northern Lights",
    icon: creator,
    iconBg: "#383E56",
    date: "Oct 2022 - Feb 2023",
    points: [
      "Directed a potent video campaign to elevate brand awareness, significantly boosting fundraising efforts and donor engagement for a mental health organisation.",
      "Played a key role in a comprehensive website overhaul, focusing on enhancing user experience and donation optimisation.",
      "Resulted in a marked increase in donations and website traffic.",
      "Collaborated with cross-functional teams to achieve project goals.",
    ],
  },
  {
    title: "Software Development Bootcamp Graduate",
    company_name: "The Growth Company",
    icon: mobile,
    iconBg: "#E6DEDD",
    date: "Jan 2024 - Mar 2024",
    points: [
      "Intensively trained in JavaScript, HTML, CSS, React, Python, SQL, and NoSQL, focusing on back-end technologies and deployment strategies.",
      "Acquired expertise in agile project management and technical problem-solving.",
      "Developed and maintained web applications using React.js and other related technologies.",
      "Participated in code reviews and provided constructive feedback to other developers.",
    ],
  },
  {
    title: "Curator/Exhibitor",
    company_name: "Various Exhibitions",
    icon: creator,
    iconBg: "#383E56",
    date: "2022",
    points: [
      "Demonstrated strong leadership and communication skills by directing diverse teams.",
      "Successfully executed exhibitions using digital tools to enhance promotion.",
      "Improved audience engagement through innovative presentation methods.",
      "Managed multiple stakeholders and project timelines effectively.",
    ],
  },
  {
    title: "Event Promoter",
    company_name: "VooDoo Events, Manchester",
    icon: creator,
    iconBg: "#E6DEDD",
    date: "Sep 2018 - Jan 2019",
    points: [
      "Enhanced project visibility and engagement through strategic social media campaigns.",
      "Developed direct customer interactions and relationship building skills.",
      "Quickly adapted to dynamic market conditions and trends.",
      "Applied creative marketing techniques to increase event attendance.",
    ],
  },
];

// Education history (extracted from CV)
export const education: Array<{
  degree: string;
  institution: string;
  date: string;
  description: string;
  icon: StaticImageData | string;
}> = [
  {
    degree: "Software Development Bootcamp",
    institution: "The Growth Company",
    date: "Jan 2024 - Mar 2024",
    description:
      "Intensively trained in JavaScript, HTML, CSS, React, Python, SQL, and NoSQL, focusing on back-end technologies and deployment strategies. Acquired expertise in agile project management and technical problem-solving.",
    icon: web,
  },
  {
    degree: "Level 2 in IT Introduction and Python",
    institution: "Codenation",
    date: "2023",
    description:
      "Delved into the essentials of coding and web development with a focus on Python. Utilized this knowledge to design a website using HTML and CSS and to develop a text-based game in Python.",
    icon: python,
  },
  {
    degree: "Level 2 in Cyber Security",
    institution: "Codenation",
    date: "2023",
    description:
      "Explored cyber-attack triaging, cyber threat analysis, Linux basics, and vulnerability scanning with NMAP, alongside networking fundamentals, cyber security legislation, Apache server hardening, and fundamental penetration testing.",
    icon: mobile,
  },
  {
    degree: "Level 3 Digital Marketing Bootcamp",
    institution: "Novi Digital",
    date: "2022",
    description:
      "Acquired insights into marketing funnels, conversion journeys, email marketing, dynamic content, personalisation, SEO, content marketing strategies, and multi-channel marketing analytics.",
    icon: creator,
  },
  {
    degree: "BA in Photography",
    institution: "University of Salford",
    date: "2020 - 2022",
    description:
      "Enhanced skills in project planning, teamwork, and problem-solving in studio and on-location settings. Developed proficiency in editing software, post-production quality, conducted independent research, and honed presentation skills and deadline management.",
    icon: creator,
  },
  {
    degree: "Level 4 Diploma in Fashion Image Making and Styling",
    institution: "University of Salford",
    date: "2018 - 2019",
    description:
      "Specialized in fashion styling and image creation techniques.",
    icon: creator,
  },
  {
    degree: "Level 3 Extended Diploma in Photography",
    institution: "SGS Stroud College",
    date: "2016 - 2018",
    description:
      "Comprehensive training in photography techniques and visual storytelling.",
    icon: creator,
  },
];

// Currently learning (from CSV)
export const currentLearning: Array<{
  course: string;
  platform: string;
  startDate: string;
  status: string;
  description: string;
  resource?: string;
}> = [
  {
    course: "Advanced Software Development and Engineering (Level 5 Diploma)",
    platform: "",
    startDate: "January 5, 2025",
    status: "Not started",
    description:
      "This course incorporates the latest trends in software development education, focusing on problem-solving, algorithms, and practical skills.",
  },
  {
    course: "CS50: Introduction to Computer Science",
    platform: "Harvard/edX",
    startDate: "November 30, 2024",
    status: "In progress",
    description:
      "Covering key programming concepts in C, Python, SQL, JavaScript and web development fundamentals.",
    resource: "https://learning.edx.org/course/course-v1:HarvardX+CS50+X",
  },
];

// Resource categories (from CSV)
export const resourceCategories = [
  "Code Snippets",
  "Documentation",
  "Tutorials",
  "Reference Materials",
  "Commands",
  "Learning Resources",
];

// Key resources
export const keyResources: Array<{ name: string; category: string; tags: string[]; url: string }> = [
  {
    name: "Prisma Database Commands",
    category: "COMMANDS",
    tags: ["COMMANDS", "Reference", "TERMINAL"],
    url: "https://www.prisma.io/docs/reference/api-reference/command-reference",
  },
  {
    name: "Django Project Commands",
    category: "COMMANDS",
    tags: ["COMMANDS", "Reference", "TERMINAL"],
    url: "https://docs.djangoproject.com/en/stable/ref/django-admin/",
  },
  {
    name: "User Authentication Tutorial",
    category: "CODE SNIPPETS",
    tags: ["Documentation", "Guide", "Tutorial"],
    url: "https://auth0.com/docs/quickstart",
  },
  {
    name: "React Native Development Resources",
    category: "Development",
    tags: ["Mobile", "React", "JavaScript"],
    url: "https://reactnative.dev/docs/getting-started",
  },
];

// Testimonials
export const testimonials: Array<{
  testimonial: string;
  name: string;
  designation: string;
  company: string;
  image: string;
}> = [
  {
    testimonial:
      "Miguel's digital marketing campaigns significantly increased our brand visibility and engagement with customers.",
    name: "Client A",
    designation: "Marketing Director",
    company: "Digital Solutions Ltd",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    testimonial:
      "His ability to develop responsive websites while optimizing for SEO helped our business reach new heights.",
    name: "Client B",
    designation: "CEO",
    company: "Tech Innovations",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
  {
    testimonial:
      "The video campaign Miguel directed for our non-profit led to a 50% increase in donations and significantly improved our online presence.",
    name: "Northern Lights",
    designation: "Fundraising Manager",
    company: "Mental Health Organization",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
  },
];

// // Projects
// const projects = [
//   {
//     name: "E-commerce Platform",
//     description:
//       "Developed and managed a complete e-commerce platform for McNasty Studios, handling everything from design to implementation, using agile methodologies for efficient project management.",
//     tags: [
//       {
//         name: "react",
//         color: "blue-text-gradient",
//       },
//       {
//         name: "mongodb",
//         color: "green-text-gradient",
//       },
//       {
//         name: "tailwind",
//         color: "pink-text-gradient",
//       },
//     ],
//     image: "project1",
//     source_code_link: "https://github.com/",
//   },
//   {
//     name: "Digital Marketing Campaigns",
//     description:
//       "Created and executed digital marketing strategies for various clients across different industries, enhancing brand presence and significantly improving engagement metrics and conversion rates.",
//     tags: [
//       {
//         name: "analytics",
//         color: "blue-text-gradient",
//       },
//       {
//         name: "seo",
//         color: "green-text-gradient",
//       },
//       {
//         name: "socialmedia",
//         color: "pink-text-gradient",
//       },
//     ],
//     image: "project2",
//     source_code_link: "https://github.com/",
//     live_link:"https://vercel.com/",
//   },
//   {
//     name: "Non-Profit Website Overhaul",
//     description:
//       "Led a comprehensive redesign and optimization of a mental health organization's website, focusing on user experience and donation pathways, resulting in increased traffic and donor engagement.",
//     tags: [
//       {
//         name: "react",
//         color: "blue-text-gradient",
//       },
//       {
//         name: "ux/ui",
//         color: "green-text-gradient",
//       },
//       {
//         name: "css",
//         color: "pink-text-gradient",
//       },
//     ],
//     image: "project3",
//     source_code_link: "https://github.com/",
//     live_link:"https://vercel.com/",
//   },
//   {
//     name: "Python Text-Based Game",
//     description:
//       "Developed an interactive text-based adventure game using Python, implementing user input validation, game state management, and narrative branching logic.",
//     tags: [
//       {
//         name: "python",
//         color: "blue-text-gradient",
        
//       },
//       {
//         name: "game-dev",
//         color: "green-text-gradient",
//       },
//       {
//         name: "cli",
//         color: "pink-text-gradient",
//       },
//     ],
//     image: "project4",
//     source_code_link: "https://github.com/",
//     live_link:"https://vercel.com/",
//   },
// ];

// Contact information
export const contact = {
  email: "cardigamiguel221@gmail.com",
  phone: "07593733782",
  location: "Greater Manchester",
  linkedin: "https://linkedin.com/in/miguel-cardiga",
  github: "https://github.com/miguelcardiga",
};

// Technical skills (categorized)
export const technicalSkills = {
  programming: [
    "JavaScript",
    "Python",
    "TypeScript",
    "HTML",
    "CSS",
    "SQL",
    "Dart",
  ],
  frameworks: [
    "React",
    "Node.js",
    "Express",
    "Flutter",
    "Tailwind CSS",
    "Redux",
  ],
  databases: ["MongoDB", "SQL", "NoSQL", "Neon Postgres"],
  tools: [
    "Git",
    "GitHub",
    "Docker",
    "Figma",
    "VS Code",
    "RESTful APIs",
    "Vercel",
    "Linux",
  ],
  methodologies: [
    "Agile",
    "DevOps",
    "CI/CD",
    "Kanban",
    "Trello",
    "User Experience Analysis",
  ],
};

