import type { ArchitectureProject } from "@/types/project";

/*
 * OWNER EDIT POINT — adding a project:
 * 1. Duplicate one project object. 2. Change its unique slug and metadata.
 * 3. Add local images. 4. Add an FBX/GLB path when available.
 * 5. Add optional camera, floor, hotspot, or view settings. 6. Save.
 */
export const projects = [
  {
    slug: "renov-proj",
    title: "Renovation Project",
    location: "Central Luzon, Philippines",
    year: "2026",
    category: "Residential",
    status: "Concept Study",
    discipline: "Architecture + Visualization",
    featured: true,
    heroImage: "/projects/renov-proj/images/hero.png",
    heroImageAlt: "Renovation Project courtyard house exterior concept render",
    thumbnailImage: "/projects/renov-proj/images/hero.png",
    summary:
      "A courtyard-centered residential concept study exploring warm materiality, planted thresholds, filtered daylight, and a gradual transition between interior and landscape.",
    narrative: [
      "The study organizes the home around a planted central court, using a sequence of compressed entries and open thresholds to connect the principal rooms with light, air, and landscape.",
      "Cream masonry, terracotta surfaces, timber screens, and deep openings create a warm material rhythm while preserving privacy from the street.",
    ],
    carousel: [
      {
        src: "/projects/renov-proj/images/gallery-01.png",
        alt: "Renovation Project alternate exterior architectural visualization",
        caption: "Exterior study",
        type: "render",
      },
      {
        src: "/projects/renov-proj/images/gallery-02.png",
        alt: "Renovation Project courtyard entrance architectural visualization",
        caption: "Entry + courtyard",
        type: "render",
      },
      {
        src: "/projects/renov-proj/images/gallery-03.png",
        alt: "Renovation Project aerial architectural visualization",
        caption: "Aerial study",
        type: "render",
      },
      {
        src: "/projects/renov-proj/images/gallery-04.png",
        alt: "Renovation Project courtyard interior visualization",
        caption: "Courtyard threshold",
        type: "render",
      },
      {
        src: "/projects/renov-proj/images/gallery-05.png",
        alt: "Renovation Project twilight exterior concept render",
        caption: "Twilight study",
        type: "render",
      },
    ],
    designIntentImage: {
      src: "/projects/renov-proj/images/design-study.png",
      alt: "Renovation Project architectural concept and presentation board",
      caption: "Design development / conceptual study",
      type: "diagram",
      layout: "full",
    },
    images: [
      {
        src: "/projects/renov-proj/images/gallery-02.png",
        alt: "Renovation Project courtyard entrance architectural visualization",
        caption: "Movement through the planted entry threshold.",
        type: "render",
        layout: "full",
      },
      {
        src: "/projects/renov-proj/images/gallery-04.png",
        alt: "Renovation Project courtyard interior visualization",
        caption: "Interior and landscape organized around the central court.",
        type: "render",
      },
      {
        src: "/projects/renov-proj/images/floor-plan.png",
        alt: "Renovation Project floor plan concept drawing",
        caption: "Floor plan / conceptual / not for construction",
        type: "plan",
        layout: "full",
      },
      {
        src: "/projects/renov-proj/images/section.png",
        alt: "Renovation Project architectural section concept drawing",
        caption: "Section / conceptual / not for construction",
        type: "section",
      },
      {
        src: "/projects/renov-proj/images/front-elevation.png",
        alt: "Renovation Project front elevation concept drawing",
        caption: "Front elevation / conceptual / not for construction",
        type: "elevation",
      },
    ],
    process: [
      {
        src: "/projects/renov-proj/images/gallery-03.png",
        alt: "Renovation Project aerial massing and courtyard visualization",
        caption: "Aerial massing and courtyard relationship.",
        type: "render",
        layout: "full",
      },
      {
        src: "/projects/renov-proj/images/design-study.png",
        alt: "Renovation Project design development presentation board",
        caption: "Design development / conceptual study.",
        type: "diagram",
      },
    ],
    model: {
      src: "/projects/renov-project.glb",
      format: "glb",
      autoCenter: true,
      groundToZero: true,
      environment: {
        background: "#dedbd3",
        groundColor: "#c9c4b9",
        exposure: 1,
      },
    },
  },
  {
    slug: "civic-forum",
    title: "Civic Forum",
    location: "Metro Manila, Philippines",
    year: "2025",
    category: "Civic",
    status: "Academic",
    role: "Replace with your role",
    featured: true,
    heroImage: "/images/projects/civic-forum-sample.png",
    thumbnailImage: "/images/projects/civic-forum-sample.png",
    summary:
      "A civic commons placeholder organized around public shade, movement, and collective gathering.",
    narrative: [
      "Replace this placeholder with the project brief and the architectural response.",
    ],
    images: [
      {
        src: "/images/projects/civic-forum-sample.png",
        alt: "Contemporary civic building entrance with a deep columned canopy",
        caption: "Public forum study — placeholder render.",
        type: "render",
        layout: "full",
      },
      {
        src: "/placeholders/architectural-drawing.svg",
        alt: "Placeholder civic circulation diagram",
        caption: "Public circulation diagram — placeholder drawing.",
        type: "diagram",
      },
      {
        src: "/placeholders/architectural-drawing.svg",
        alt: "Placeholder section through the Civic Forum",
        caption: "Forum section — placeholder drawing.",
        type: "section",
      },
    ],
  },
  {
    slug: "timber-research-pavilion",
    title: "Timber Research Pavilion",
    shortTitle: "Timber Pavilion",
    location: "Laguna, Philippines",
    year: "2024",
    category: "Academic",
    status: "Research",
    role: "Replace with your role",
    featured: true,
    heroImage: "/images/projects/timber-pavilion-sample.png",
    thumbnailImage: "/images/projects/timber-pavilion-sample.png",
    summary:
      "An editable pavilion study exploring repeatable timber frames and climate-responsive enclosure.",
    narrative: [
      "Replace this placeholder with research questions, fabrication methods, and design outcomes.",
    ],
    images: [
      {
        src: "/images/projects/timber-pavilion-sample.png",
        alt: "Open timber pavilion framed by a repeating pitched-roof structure",
        caption: "Structural rhythm study — placeholder render.",
        type: "render",
        layout: "full",
      },
      {
        src: "/placeholders/architectural-drawing.svg",
        alt: "Placeholder structural section for the Timber Research Pavilion",
        caption: "Assembly section — placeholder drawing.",
        type: "section",
      },
    ],
  },
  {
    slug: "project-placeholder-04",
    title: "Project Placeholder 04",
    shortTitle: "Placeholder 04",
    location: "Batangas, Philippines",
    year: "20XX",
    category: "Conceptual",
    status: "In development",
    role: "Replace with your role",
    featured: false,
    heroImage: "/images/projects/project-placeholder-04-sample.png",
    thumbnailImage: "/images/projects/project-placeholder-04-sample.png",
    summary:
      "An editable placeholder for a future architectural project, study, or visualization.",
    narrative: [
      "Replace this placeholder with the project brief, design intent, and architectural response.",
    ],
    images: [
      {
        src: "/images/projects/project-placeholder-04-sample.png",
        alt: "Minimal hillside residence with terraces and mountain views",
        caption: "Placeholder render - replace with final project imagery.",
        type: "render",
        layout: "full",
      },
      {
        src: "/placeholders/architectural-drawing.svg",
        alt: "Placeholder architectural drawing for Project Placeholder 04",
        caption: "Placeholder drawing - replace with project documentation.",
        type: "diagram",
      },
    ],
  },
  {
    slug: "project-placeholder-05",
    title: "Project Placeholder 05",
    shortTitle: "Placeholder 05",
    location: "Batangas, Philippines",
    year: "20XX",
    category: "Conceptual",
    status: "In development",
    role: "Replace with your role",
    featured: false,
    heroImage: "/images/projects/project-placeholder-05-sample.png",
    thumbnailImage: "/images/projects/project-placeholder-05-sample.png",
    summary:
      "An editable placeholder for an upcoming architectural concept and spatial investigation.",
    narrative: [
      "Replace this placeholder with the project context, spatial strategy, and development process.",
    ],
    images: [
      {
        src: "/images/projects/project-placeholder-05-sample.png",
        alt: "Contemporary residence with a sloped roof and terracotta accents",
        caption: "Placeholder drawing - replace with final project documentation.",
        type: "plan",
        layout: "full",
      },
      {
        src: "/placeholders/architecture-placeholder.svg",
        alt: "Placeholder architectural visualization for Project Placeholder 05",
        caption: "Placeholder visualization - replace with final project imagery.",
        type: "render",
      },
    ],
  },
] satisfies readonly ArchitectureProject[];
