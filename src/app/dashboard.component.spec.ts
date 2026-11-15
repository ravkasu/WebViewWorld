import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard.component';

describe('DashboardPage', () => {
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
});
