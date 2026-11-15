import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type WebsiteCategory = 'Photography' | 'Portfolio' | 'Business' | 'Blog' | 'Store' | 'Other';
type DashboardFilter = 'All websites' | WebsiteCategory;
type WebsiteStatus = 'Live' | 'Draft';

interface Website {
  id: string;
  number: number;
  name: string;
  category: WebsiteCategory;
  status: WebsiteStatus;
  cover: string;
  description: string;
  url?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardPage {
  protected readonly categories: WebsiteCategory[] = [
    'Photography',
    'Portfolio',
    'Business',
    'Blog',
    'Store',
    'Other',
  ];
  protected readonly filters: DashboardFilter[] = ['All websites', ...this.categories];
  protected readonly activeFilter = signal<DashboardFilter>('All websites');
  protected readonly createDialogOpen = signal(false);
  protected readonly storageMessage = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly thumbnailLoading = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected draftName = '';
  protected draftCategory: WebsiteCategory = 'Portfolio';
  protected draftUrl = '';
  protected draftThumbnail: string | null = null;
  protected readonly createdWebsites = signal(this.loadWebsites());

  protected readonly currentWebsite: Website = {
    id: 'website-1',
    number: 1,
    name: 'Maya June',
    category: 'Photography',
    status: 'Live',
    cover: 'images/hero-editorial.jpg',
    description: 'A warm, editorial photography portfolio.',
    url: '/website-1',
  };

  protected readonly websites = computed(() => [this.currentWebsite, ...this.createdWebsites()]);
  protected readonly visibleWebsites = computed(() => {
    const filter = this.activeFilter();
    return filter === 'All websites'
      ? this.websites()
      : this.websites().filter((website) => website.category === filter);
  });
  protected readonly liveCount = computed(
    () => this.websites().filter((website) => website.status === 'Live').length,
  );
  protected readonly draftCount = computed(
    () => this.websites().filter((website) => website.status === 'Draft').length,
  );

  protected openCreateDialog(): void {
    this.editingId.set(null);
    this.draftName = '';
    this.draftCategory = 'Portfolio';
    this.draftUrl = '';
    this.draftThumbnail = null;
    this.formError.set(null);
    this.createDialogOpen.set(true);
  }

  protected openEditDialog(website: Website): void {
    this.editingId.set(website.id);
    this.draftName = website.name;
    this.draftCategory = website.category;
    this.draftUrl = website.url ?? '';
    this.draftThumbnail = website.cover;
    this.formError.set(null);
    this.createDialogOpen.set(true);
  }

  protected closeDialog(): void {
    this.createDialogOpen.set(false);
  }

  protected setFilter(filter: DashboardFilter): void {
    this.activeFilter.set(filter);
  }

  protected updateDraftName(event: Event): void {
    this.draftName = (event.target as HTMLInputElement).value;
  }

  protected updateDraftCategory(event: Event): void {
    this.draftCategory = (event.target as HTMLSelectElement).value as WebsiteCategory;
  }

  protected updateDraftUrl(event: Event): void {
    this.draftUrl = (event.target as HTMLInputElement).value;
  }

  protected async updateDraftThumbnail(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.formError.set(null);
    if (!file.type.startsWith('image/')) {
      this.formError.set('Choose an image file to use as your website thumbnail.');
      input.value = '';
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      this.formError.set('Choose an image smaller than 8 MB.');
      input.value = '';
      return;
    }

    try {
      this.thumbnailLoading.set(true);
      this.draftThumbnail = await this.createThumbnail(file);
    } catch (error) {
      console.error('Unable to prepare the website thumbnail.', error);
      this.formError.set('This image could not be opened. Try a different image file.');
      input.value = '';
    } finally {
      this.thumbnailLoading.set(false);
    }
  }

  protected removeDraftThumbnail(): void {
    this.draftThumbnail = null;
  }

  protected saveWebsite(event: Event): void {
    event.preventDefault();
    const name = this.draftName.trim();
    const enteredUrl = this.draftUrl.trim();
    const url = this.normalizeWebsiteUrl(enteredUrl);
    if (!name) {
      return;
    }
    if (enteredUrl && !url) {
      this.formError.set('Enter a valid website address starting with http:// or https://.');
      return;
    }

    const editingId = this.editingId();
    let updatedWebsites: Website[];

    if (editingId) {
      updatedWebsites = this.createdWebsites().map((website) =>
        website.id === editingId
          ? {
              ...website,
              name,
              category: this.draftCategory,
              cover: this.draftThumbnail ?? this.coverFor(this.draftCategory),
              url,
            }
          : website,
      );
    } else {
      const newWebsite: Website = {
        id: globalThis.crypto.randomUUID(),
        number: this.createdWebsites().length + 2,
        name,
        category: this.draftCategory,
        status: 'Draft',
        cover: this.draftThumbnail ?? this.coverFor(this.draftCategory),
        description: `A new ${this.draftCategory.toLowerCase()} website, ready for your ideas.`,
        url,
      };
      updatedWebsites = [...this.createdWebsites(), newWebsite];
    }

    if (!this.persistWebsites(updatedWebsites)) {
      return;
    }
    this.createdWebsites.set(updatedWebsites);
    this.closeDialog();
  }

  protected websiteLabel(website: Website): string {
    return `Website ${String(website.number).padStart(2, '0')}`;
  }

  protected nextWebsiteLabel(): string {
    return `Website ${String(this.createdWebsites().length + 2).padStart(2, '0')}`;
  }

  private coverFor(category: WebsiteCategory): string {
    const covers: Record<WebsiteCategory, string> = {
      Photography: 'images/project-portraits.jpg',
      Portfolio: 'images/project-campaign.jpg',
      Business: 'images/project-studio.jpg',
      Blog: 'images/project-landscape.jpg',
      Store: 'images/project-still-life.jpg',
      Other: 'images/project-light.jpg',
    };
    return covers[category];
  }

  private createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('The image file could not be read.'));
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          reject(new Error('The image file did not produce image data.'));
          return;
        }

        const image = new Image();
        image.onerror = () => reject(new Error('The selected file is not a readable image.'));
        image.onload = () => {
          const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Image processing is unavailable in this browser.'));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  private normalizeWebsiteUrl(value: string): string {
    if (!value) {
      return '';
    }

    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
    } catch (error) {
      if (error instanceof TypeError) {
        return '';
      }
      throw error;
    }
  }

  private loadWebsites(): Website[] {
    try {
      const saved = localStorage.getItem('webviewworld.websites');
      if (!saved) {
        return [];
      }

      const parsed: unknown = JSON.parse(saved);
      if (!Array.isArray(parsed)) {
        throw new Error('Saved website data is not a list.');
      }

      return parsed
        .filter((website): website is Website => this.isWebsite(website))
        .map((website) => ({
          ...website,
          url: this.normalizeWebsiteUrl(website.url ?? ''),
        }));
    } catch (error) {
      console.error('Unable to load saved websites.', error);
      this.storageMessage.set('Saved websites could not be loaded from this browser.');
      return [];
    }
  }

  private isWebsite(value: unknown): value is Website {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const website = value as Record<string, unknown>;
    return (
      typeof website['id'] === 'string' &&
      typeof website['number'] === 'number' &&
      typeof website['name'] === 'string' &&
      typeof website['category'] === 'string' &&
      this.categories.includes(website['category'] as WebsiteCategory) &&
      website['status'] === 'Draft' &&
      typeof website['cover'] === 'string' &&
      typeof website['description'] === 'string' &&
      (website['url'] === undefined || typeof website['url'] === 'string')
    );
  }

  private persistWebsites(websites: Website[]): boolean {
    try {
      localStorage.setItem('webviewworld.websites', JSON.stringify(websites));
      this.storageMessage.set(null);
      return true;
    } catch (error) {
      console.error('Unable to save website changes.', error);
      this.storageMessage.set('This website card could not be saved in your browser.');
      return false;
    }
  }
}
