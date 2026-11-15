import { Routes } from '@angular/router';
import { DashboardPage } from './dashboard.component';
import { PortfolioPage } from './portfolio-page.component';

export const routes: Routes = [
  { path: '', component: DashboardPage, title: 'WebView World — Your websites' },
  { path: 'website-1', component: PortfolioPage, title: 'Maya June — Photography' },
  { path: '**', redirectTo: '' },
];
