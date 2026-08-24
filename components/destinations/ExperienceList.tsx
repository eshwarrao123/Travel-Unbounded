import { Experience } from '@/lib/types';

interface ExperienceListProps {
  experiences: Experience[];
}

export default function ExperienceList({ experiences }: ExperienceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {experiences.map((experience, index) => (
        <div
          key={index}
          className="border-l-2 border-[var(--color-accent)] pl-6 py-2"
        >
          <h3 className="heading-subsection text-[var(--color-text-primary)] mb-2">
            {experience.title}
          </h3>
          <p className="body-small text-[var(--color-text-secondary)]">
            {experience.description}
          </p>
        </div>
      ))}
    </div>
  );
}
