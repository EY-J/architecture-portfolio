export type Vector3Tuple = readonly [number, number, number];

export type ProjectImageType =
  | "render" |"photo" |"plan" |"section" |"elevation" |"diagram";

export type ProjectGalleryCategory =
  | "design" |"actual" |"drawings" |"process";

export type ProjectImage = {
  src: string;
  alt: string;
  caption?: string;
  type?: ProjectImageType;
  layout?: "full" | "grid";
  galleryCategory?: ProjectGalleryCategory;
};

export type ModelFormat = "fbx" | "glb" | "gltf" | "auto";

export type ProjectCamera = {
  position?: Vector3Tuple;
  target?: Vector3Tuple;
  minDistance?: number;
  maxDistance?: number;
};

export type ProjectEnvironment = {
  background?: string;
  groundColor?: string;
  exposure?: number;
};

export type ProjectFloor = {
  id: string;
  label: string;
  objectNamePatterns: readonly string[];
};

export type ProjectHotspot = {
  id: string;
  label: string;
  description?: string;
  position: Vector3Tuple;
};

export type ProjectView = {
  id: string;
  label: string;
  position: Vector3Tuple;
  target: Vector3Tuple;
};

export type ArchitectureModel = {
  src?: string;
  primarySrc?: string;
  fallbackSrc?: string;
  format?: ModelFormat;
  /** Uses local Three.js geometry until an owner-provided model is configured. */
  placeholder?: boolean;
  scale?: number;
  rotation?: Vector3Tuple;
  position?: Vector3Tuple;
  autoCenter?: boolean;
  groundToZero?: boolean;
  camera?: ProjectCamera;
  environment?: ProjectEnvironment;
  floors?: readonly ProjectFloor[];
  hotspots?: readonly ProjectHotspot[];
  views?: readonly ProjectView[];
};

export type ArchitectureProject = {
  slug: string;
  title: string;
  shortTitle?: string;
  location: string;
  year: string;
  category: string;
  status?: string;
  discipline?: string;
  area?: string;
  role?: string;
  collaborators?: readonly string[];
  software?: readonly string[];
  featured?: boolean;
  heroImage: string;
  heroImageAlt?: string;
  thumbnailImage: string;
  summary: string;
  narrative?: readonly string[];
  carousel?: readonly ProjectImage[];
  designIntentImage?: ProjectImage;
  images?: readonly ProjectImage[];
  process?: readonly ProjectImage[];
  model?: ArchitectureModel;
};
