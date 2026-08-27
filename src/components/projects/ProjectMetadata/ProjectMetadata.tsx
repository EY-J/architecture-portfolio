import type { ArchitectureProject } from "@/types/project";

import styles from "./ProjectMetadata.module.css";

type ProjectMetadataProps = {
  project: ArchitectureProject;
  compact?: boolean;
};

export function ProjectMetadata({ project, compact = false }: ProjectMetadataProps) {
  const entries = [
    ["Type", project.category],
    ["Location", project.location],
    ["Year", project.year],
    ["Status", project.status],
    ["Discipline", project.discipline],
    ["Area", project.area],
    ["Role", project.role],
    ["Collaborators", project.collaborators?.join(", ")],
    ["Software", project.software?.join(", ")],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <dl className={`${styles.list} ${compact ? styles.compact : ""}`}>
      {entries.map(([label, value]) => (
        <div className={styles.entry} key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
