export type DesignFocusArea = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
};

// OWNER EDIT POINT: Replace these image paths as dedicated focus imagery becomes available.
export const designFocusAreas = [
  {
    title: "Architectural Design",
    description:
      "I shape spatial plans, form, and function around each project’s context.",
    image: "/placeholders/courtyard-residence.svg",
    imageAlt: "Abstract architectural volumes arranged around a courtyard",
  },
  {
    title: "Interior Design",
    description:
      "I study materials, atmosphere, detail, and the experience of interior space.",
    image: "/placeholders/civic-forum.svg",
    imageAlt: "Architectural study of layered interior and civic spaces",
  },
  {
    title: "Renovation",
    description:
      "I rework existing spaces through careful, purposeful spatial improvements.",
    image: "/placeholders/timber-pavilion.svg",
    imageAlt: "Timber frame study representing an adaptable existing structure",
  },
  {
    title: "3D Visualization",
    description:
      "I use rendering and spatial studies to communicate architectural ideas clearly.",
    image: "/placeholders/architecture-placeholder.svg",
    imageAlt: "Warm-toned architectural visualization study",
  },
  {
    title: "Concept Development",
    description:
      "I develop early ideas through sketches, diagrams, and iterative design studies.",
    image: "/placeholders/architectural-drawing.svg",
    imageAlt: "Architectural plan and diagram study",
  },
] satisfies readonly DesignFocusArea[];
