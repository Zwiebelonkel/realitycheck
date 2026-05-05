import { Routes } from '@angular/router';
import { StartPageComponent } from './start-page/start-page.component';
import { GamePageComponent } from './game-page/game-page.component';
import { ResultPageComponent } from './result-page/result-page.component';

export const routes: Routes = [
  { path: '', component: StartPageComponent },
  { path: 'game', component: GamePageComponent },
  { path: 'results', component: ResultPageComponent },
  { path: '**', redirectTo: '' },
];
