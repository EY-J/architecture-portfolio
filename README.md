# Three.js Architectural Portfolio

An original, configuration-driven architecture portfolio built with Next.js, React,
TypeScript, Three.js, React Three Fiber, Drei, and GSAP.

The website combines editorial project pages with a reusable fullscreen model viewer.
Project content stays in `src/data/projects.ts`; adding a normal project does not require
editing the viewer or model loader.

The repository currently uses local placeholder imagery and includes an owner-provided
GLB for the Renovation Project. Projects without an external model continue to use the
procedural architectural fallback until you add an FBX, GLB, or GLTF source.

## Quick start

Requirements:

- Node.js current LTS
- npm

Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Quality checks:

```bash
npm run typecheck
npm run lint
npm run build
```

Production preview:

```bash
npm run build
npm run start
```

## Routes

- `/` — portfolio home
- `/projects` — configuration-driven project index
- `/projects/<slug>` — generated project detail page
- `/experience/<slug>` — reusable fullscreen 3D viewer
- `/about` — editable profile
- `/contact` — editable contact information

Projects without a model remain fully available as editorial project pages. Their
experience route shows the hero image and a concise fallback message instead of an empty
canvas or nonfunctional controls.

## Primary owner edit points

| Purpose | File or directory |
| --- | --- |
| Portfolio identity, email, location, social URLs | `src/config/site.ts` |
| Header links | `src/config/navigation.ts` |
| Project metadata and model configuration | `src/data/projects.ts` |
| Global brand colors, fonts, spacing | `src/styles/tokens.css` |
| Global reset and shared behavior | `src/app/globals.css` |
| Project images | `public/projects/<slug>/images/` |
| FBX, GLB, GLTF, and textures | `public/projects/<slug>/model/` |

Empty social URLs are not rendered.

## Add an FBX project

### Step A — Create the project folder

```text
public/projects/my-project/
```

### Step B — Add the model

```text
public/projects/my-project/model/model.fbx
```

### Step C — Add textures if needed

```text
public/projects/my-project/model/textures/
```

An FBX with embedded media may not need a separate texture directory. Browser loaders
cannot reliably resolve absolute texture paths that point to folders on the computer
where the FBX was exported.

### Step D — Add images

```text
public/projects/my-project/images/
├── hero.jpg
├── thumb.jpg
├── render-01.jpg
├── plan-01.jpg
└── section-01.jpg
```

Only reference files that actually exist. Plans and sections use contain-style image
presentation so fine linework is not cropped.

### Step E — Add project data

Duplicate one object in `src/data/projects.ts`, then edit its slug, text, images, and
model path:

```ts
{
  slug: "my-project",
  title: "My Project",
  location: "Philippines",
  year: "2026",
  category: "Architecture",
  heroImage: "/projects/my-project/images/hero.jpg",
  thumbnailImage: "/projects/my-project/images/thumb.jpg",
  summary: "Replace this description.",
  model: {
    src: "/projects/my-project/model/model.fbx",
    format: "fbx",
    autoCenter: true,
    groundToZero: true
  }
}
```

The file is TypeScript, so project-specific rotation values such as `Math.PI` are valid.

### Step F — Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000/projects/my-project
http://localhost:3000/experience/my-project
```

The project automatically appears in the index and uses the shared detail and viewer
routes.

## Recommended asset layout

```text
public/projects/<slug>/
├── images/
│   ├── hero.jpg
│   ├── thumb.jpg
│   ├── render-01.jpg
│   ├── render-02.jpg
│   ├── plan-01.jpg
│   └── section-01.jpg
└── model/
    ├── model.fbx
    ├── model.glb
    └── textures/
```

You do not need both FBX and GLB. One valid model source is enough.

## FBX, GLB, and GLTF support

The loader accepts:

- `.fbx` through `FBXLoader`
- `.glb` through `GLTFLoader`
- `.gltf` through `GLTFLoader`
- `format: "auto"` when the extension can identify the format

Format-specific logic remains behind one reusable loader. The viewer loads only on an
experience route; model files and the Three.js engine are not preloaded by the home,
project index, or project detail pages.

For an optimized production model with an FBX fallback:

```ts
model: {
  primarySrc: "/projects/my-project/model/model.glb",
  fallbackSrc: "/projects/my-project/model/model.fbx",
  format: "glb",
  autoCenter: true,
  groundToZero: true
}
```

The fallback is attempted once. The viewer does not enter an infinite retry loop.

## Model transforms and camera tuning

Architecture exports vary in axis, unit scale, and origin. Corrections belong to the
individual project configuration, not the global loader:

```ts
model: {
  src: "/projects/my-project/model/model.fbx",
  format: "fbx",
  scale: 0.01,
  rotation: [-Math.PI / 2, 0, 0],
  position: [0, 0, 0],
  autoCenter: true,
  groundToZero: true,
  camera: {
    position: [12, 8, 14],
    target: [0, 2, 0],
    minDistance: 2,
    maxDistance: 40
  }
}
```

When no camera position is configured, the viewer computes model bounds and fits a
perspective camera to the actual aspect ratio. This works for wide sites, low buildings,
houses, and towers without assuming cubic geometry.

Try project settings in this order:

1. rotation,
2. scale,
3. automatic centering and grounding,
4. optional position offset,
5. optional camera override.

Never rewrite or re-export the asset from application code just to correct one project's
orientation.

## Optional architecture tools

Controls appear only when their configuration exists. Section clipping is available for
every valid scene.

### Saved views

```ts
views: [
  {
    id: "overview",
    label: "Overview",
    position: [12, 8, 14],
    target: [0, 2, 0]
  },
  {
    id: "entry",
    label: "Entrance",
    position: [3, 2, 8],
    target: [0, 1.5, 0]
  }
]
```

Saved views animate with restrained easing. Reduced-motion preferences switch them
immediately.

### Floor isolation

Floor isolation is based only on configured object-name patterns. The viewer does not
guess floors.

Recommended export naming:

```text
FLOOR_00_GROUND_*
FLOOR_01_FIRST_*
FLOOR_02_SECOND_*
ROOF_*
SITE_*
```

Configuration:

```ts
floors: [
  {
    id: "ground",
    label: "Ground Floor",
    objectNamePatterns: ["FLOOR_00", "GROUND"]
  },
  {
    id: "first",
    label: "First Floor",
    objectNamePatterns: ["FLOOR_01", "FIRST"]
  }
]
```

Patterns are case-insensitive substring matches. Use distinctive names so an object does
not accidentally match multiple floors.

### Hotspots

Hotspot positions are Three.js world coordinates after the model's configured transforms:

```ts
hotspots: [
  {
    id: "main-entry",
    label: "Main Entrance",
    description: "Replace with project-specific information.",
    position: [0, 1.8, 4]
  }
]
```

Hotspots render as keyboard-accessible HTML controls. Important information should still
be included on the project page because a canvas cannot replace semantic HTML.

## Materials, sectioning, and viewer controls

The viewer provides:

- original imported materials,
- a neutral clay override,
- a technical wireframe override,
- orbit, pan, and bounded zoom,
- reset view,
- browser fullscreen when supported,
- one X/Y/Z clipping plane,
- project information and help panels,
- keyboard shortcuts shown in the Help panel.

Original material and visibility references are restored after temporary overrides. The
viewer disposes imported geometry, materials, textures, and application-created override
materials when it unmounts.

## Performance guidance

The viewer caps device pixel ratio and reduces expensive defaults on mobile:

- mobile DPR up to `1.25`, shadows disabled,
- desktop DPR up to `1.75`, restrained 1024px shadow maps,
- demand-based rendering,
- no default post-processing,
- no model preload outside the active experience route.

Direct FBX delivery is supported, but suitability depends on the asset:

```text
Small or medium FBX
    -> direct viewer may be acceptable

Large production FBX
    -> optimize geometry and textures
    -> reduce material count and draw calls
    -> export an optimized GLB
    -> use GLB as primary
    -> optionally retain FBX as fallback/original source
```

There is no arbitrary file-size limit because files are stored directly in `public/`.
Measure on the actual target phones and laptops.

## Missing textures and model errors

If a texture dependency fails, the loader records a development warning and preserves
geometry where possible. Meshes without a usable material receive a neutral fallback.

If parsing or loading fails, visitors see the project's hero render, a concise status,
and a route back to the project page. Stack traces are not exposed in public UI.

Before treating an FBX problem as a viewer bug, check:

- the FBX opens correctly in its source application,
- the export uses a supported modern FBX version,
- textures are embedded or copied into the project,
- texture paths are not absolute desktop-only paths,
- texture filenames and URLs are valid for the web,
- geometry is reasonably close to its origin,
- scale and units are known,
- axis orientation is known,
- polygon count and material count are practical,
- texture resolution is appropriate for target devices,
- mesh/group names are meaningful if floor isolation is required.

If geometry loads but textures do not, fix texture collection or export settings in the
source modeling application. If the FBX itself dominates load time or memory, optimize it
or produce a GLB rather than weakening the entire viewer for one asset.

## Accessibility and fallback behavior

The site uses semantic headings, visible focus states, keyboard-accessible navigation and
viewer controls, descriptive image text, live loading/error status, Escape handling, and
reduced-motion support. Panels restore focus to the control that opened them.

The editorial project page never depends on WebGL. If WebGL is unsupported or its context
is lost, the viewer route keeps navigation and project imagery available.

## Deployment notes

Model and image URLs beginning with `/projects/` are served from the Next.js `public/`
directory. Deploy those assets with the application and preserve their case-sensitive
paths. Large model files may increase deployment transfer and storage requirements even
though they are loaded lazily by the browser.

Before deployment, run:

```bash
npm run typecheck
npm run lint
npm run build
```
