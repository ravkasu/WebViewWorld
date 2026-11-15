import { TestBed } from '@angular/core/testing';
import { PortfolioPage } from './portfolio-page.component';

describe('PortfolioPage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
    }).compileComponents();
  });

  it('shows the portfolio and filters projects by category', () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Ordinary days');
    expect(compiled.querySelectorAll('.project-card')).toHaveLength(6);

    const fashionFilter = Array.from(
      compiled.querySelectorAll<HTMLButtonElement>('.filter-button'),
    ).find((button) => button.textContent?.trim() === 'Fashion');
    fashionFilter?.click();
    fixture.detectChanges();

    expect(compiled.querySelectorAll('.project-card')).toHaveLength(2);
  });

  it('opens and closes a project preview', () => {
    const fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    compiled.querySelector<HTMLButtonElement>('.project-card')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="dialog"]')).not.toBeNull();

    compiled.querySelector<HTMLButtonElement>('.lightbox-close')?.click();
    fixture.detectChanges();
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });
});
