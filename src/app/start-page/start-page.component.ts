import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

type Difficulty = 'easy' | 'medium' | 'hard';

@Component({
  selector: 'app-start-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-page.component.html',
  styleUrls: ['./start-page.component.scss'],
})
export class StartPageComponent {
  selectedDifficulty: 'easy' | 'medium' | 'hard' | null = null;

  difficulties: {
    key: Difficulty;
    label: string;
    sub: string;
    desc: string;
  }[] = [
    {
      key: 'easy',
      label: 'EASY',
      sub: 'Old AI Models',
      desc: 'Obvious artifacts, early GAN era',
    },
    {
      key: 'medium',
      label: 'MEDIUM',
      sub: 'Newer AI Models',
      desc: 'Improved realism, harder to spot',
    },
    {
      key: 'hard',
      label: 'HARD',
      sub: 'Current AI Models',
      desc: 'State-of-the-art — nearly perfect fakes',
    },
  ];

  constructor(private router: Router) {}

  select(diff: 'easy' | 'medium' | 'hard') {
    this.selectedDifficulty = diff;
  }

  start() {
    if (!this.selectedDifficulty) return;
    this.router.navigate(['/game'], {
      queryParams: { difficulty: this.selectedDifficulty },
    });
  }
}
