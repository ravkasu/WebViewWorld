import { Component, computed, signal } from '@angular/core';

type ProjectCategory = 'Fashion' | 'Portraits' | 'Campaigns';
type PortfolioFilter = 'All work' | ProjectCategory;

interface Project {
  id: number;
  title: string;
  category: ProjectCategory;
  year: string;
  image: string;
  alt: string;
  description: string;
}

@Component({
  selector: 'app-portfolio-page',
  templateUrl: './portfolio-page.component.html',
})
export class PortfolioPage {
  protected readonly filters: PortfolioFilter[] = ['All work', 'Fashion', 'Portraits', 'Campaigns'];
  protected readonly activeFilter = signal<PortfolioFilter>('All work');
  protected readonly selectedProject = signal<Project | null>(null);
  protected readonly menuOpen = signal(false);

  protected readonly projects: Project[] = [
    {
      id: 1,
      title: 'Soft, in the sun',
      category: 'Fashion',
      year: '2025',
      image: 'images/project-campaign.jpg',
      alt: 'Fashion editorial photographed in warm afternoon light',
      description:
        'An airy, sun-washed story about the little rituals that make a day feel like your own.',
    },
    {
      id: 2,
      title: 'The quiet ones',
      category: 'Portraits',
      year: '2025',
      image: 'images/project-portraits.jpg',
      alt: 'Intimate natural-light portrait',
      description:
        'A collection of honest portraits made slowly, with room for every subject to simply be.',
    },
    {
      id: 3,
      title: 'A study in blue',
      category: 'Campaigns',
      year: '2024',
      image: 'images/project-studio.jpg',
      alt: 'Expressive fashion campaign portrait',
      description:
        'A playful color story created for people who are never afraid to take up space.',
    },
    {
      id: 4,
      title: 'Somewhere, slowly',
      category: 'Fashion',
      year: '2024',
      image: 'images/project-form.jpg',
      alt: 'Model in a considered, sculptural fashion look',
      description: 'Thoughtful shapes, long shadows, and the beauty of not being in a hurry.',
    },
    {
      id: 5,
      title: 'Made of moments',
      category: 'Campaigns',
      year: '2024',
      image: 'images/project-light.jpg',
      alt: 'Candid lifestyle moment shared between friends',
      description:
        'A joyful, people-first campaign celebrating the moments that happen between the poses.',
    },
    {
      id: 6,
      title: 'After the rain',
      category: 'Portraits',
      year: '2023',
      image: 'images/project-landscape.jpg',
      alt: 'Quiet landscape in soft golden-hour light',
      description:
        'An open-ended portrait of place, light, and the feeling of finding your way back.',
    },
  ];

  protected readonly visibleProjects = computed(() => {
    const filter = this.activeFilter();
    return filter === 'All work'
      ? this.projects
      : this.projects.filter((project) => project.category === filter);
  });

  protected setFilter(filter: PortfolioFilter): void {
    this.activeFilter.set(filter);
  }

  protected openProject(project: Project): void {
    this.selectedProject.set(project);
  }

  protected closeProject(): void {
    this.selectedProject.set(null);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
