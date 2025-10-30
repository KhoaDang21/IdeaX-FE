import type { FC } from "react";
import type { ProjectUI } from "../../../interfaces/startup/myprojects";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: ProjectUI[];
  selectedProject: number | null;
  deletingProjectIds: number[];
  onSelectProject: (id: number) => void;
  onDeleteProject: (id: number) => void;
  onViewDetails: (id: number) => void;
}

export const ProjectCarousel: FC<Props> = ({
  projects,
  selectedProject,
  deletingProjectIds,
  onSelectProject,
  onDeleteProject,
  onViewDetails,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        marginBottom: 24,
        overflowX: "auto",
        paddingBottom: 8,
      }}
    >
      {projects.map((project) => {
        const isSelected = selectedProject === project.id;
        const isDeleting = deletingProjectIds.includes(project.id);
        const isDeletionDisallowed = !["DRAFT", "REJECTED"].includes(
          project.status.toUpperCase()
        );

        return (
          <ProjectCard
            key={project.id}
            project={project}
            isSelected={isSelected}
            isDeleting={isDeleting}
            isDeletionDisallowed={isDeletionDisallowed}
            onSelect={onSelectProject}
            onDelete={onDeleteProject}
            onViewDetails={onViewDetails}
          />
        );
      })}
    </div>
  );
};
