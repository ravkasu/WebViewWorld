import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { DashboardPage } from './dashboard.component';

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('shows the running website and creates a saved website card', async () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Maya June');
    expect(compiled.querySelector('.status-live')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.create-button')?.click();
    fixture.detectChanges();
    const nameInput = compiled.querySelector<HTMLInputElement>('#website-name');
    expect(nameInput).not.toBeNull();
    nameInput!.value = 'Sunday Studio';
    nameInput!.dispatchEvent(new Event('input', { bubbles: true }));
    const urlInput = compiled.querySelector<HTMLInputElement>('#website-url');
    expect(urlInput).not.toBeNull();
    urlInput!.value = 'https://example.com/sunday';
    urlInput!.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    const submitButton = compiled.querySelector<HTMLButtonElement>('.dialog-submit');
    expect(submitButton?.disabled).toBe(false);
    submitButton?.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(compiled.textContent).toContain('Sunday Studio');
    expect(compiled.textContent).toContain('Website 02');
    const savedWebsites = JSON.parse(localStorage.getItem('webviewworld.websites') ?? '[]');
    expect(savedWebsites).toHaveLength(1);
    expect(savedWebsites[0].url).toBe('https://example.com/sunday');
    expect(compiled.querySelector('.draft-card a[target="_blank"]')?.getAttribute('href')).toBe(
      'https://example.com/sunday',
    );
    expect(compiled.querySelector('.draft-card a[target="_blank"]')?.getAttribute('rel')).toBe(
      'noopener noreferrer',
    );
  });

  it('rejects website links that do not use http or https', () => {
    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.create-button')?.click();
    fixture.detectChanges();

    const nameInput = compiled.querySelector<HTMLInputElement>('#website-name')!;
    nameInput.value = 'Unsafe link';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    const urlInput = compiled.querySelector<HTMLInputElement>('#website-url')!;
    urlInput.value = 'javascript:alert(1)';
    urlInput.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();

    compiled
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    expect(compiled.querySelector('.dialog-error')?.textContent).toContain(
      'starting with http:// or https://',
    );
    expect(JSON.parse(localStorage.getItem('webviewworld.websites') ?? '[]')).toHaveLength(0);
  });

  it('creates a compact thumbnail from an uploaded image and saves it with the website', async () => {
    class MockImage {
      naturalWidth = 1600;
      naturalHeight = 1200;
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;

      set src(_value: string) {
        this.onload?.(new Event('load'));
      }
    }

    vi.stubGlobal('Image', MockImage);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/jpeg;base64,thumbnail',
    );

    const fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.create-button')?.click();
    fixture.detectChanges();
    compiled.querySelector<HTMLInputElement>('#website-name')!.value = 'Photo Studio';
    compiled
      .querySelector<HTMLInputElement>('#website-name')!
      .dispatchEvent(new Event('input', { bubbles: true }));

    const fileInput = compiled.querySelector<HTMLInputElement>('#website-thumbnail')!;
    const imageFile = new File(['image'], 'cover.png', { type: 'image/png' });
    Object.defineProperty(fileInput, 'files', { value: [imageFile], configurable: true });
    await fixture.componentInstance['updateDraftThumbnail']({
      target: fileInput,
    } as unknown as Event);
    await fixture.whenStable();
    fixture.detectChanges();

    compiled
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    fixture.detectChanges();

    const thumbnail = compiled.querySelector<HTMLImageElement>('.draft-card .website-preview img');
    expect(thumbnail?.getAttribute('src')).toBe('data:image/jpeg;base64,thumbnail');
    expect(JSON.parse(localStorage.getItem('webviewworld.websites') ?? '[]')[0].cover).toBe(
      'data:image/jpeg;base64,thumbnail',
    );
  });
});
