import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-page.component.html',
  styleUrls: ['./result-page.component.scss'],
})
export class ResultPageComponent implements OnInit {
  score = 0;
  total = 10;
  difficulty = 'medium';
  accuracy = 0;

  title = '';
  titleDesc = '';

  tiers = [
    {
      min: 80,
      max: 100,
      label: 'AI-EXPERT',
      desc: 'You can reliably spot AI-generated content.',
      color: '#2dff7a',
    },
    {
      min: 50,
      max: 79,
      label: 'SKEPTIC',
      desc: "You're suspicious, but not always right.",
      color: '#ffb82d',
    },
    {
      min: 0,
      max: 49,
      label: 'AI-BLIND',
      desc: 'AI has you fooled. Train harder.',
      color: '#ff2d2d',
    },
  ];

  activeTier: (typeof this.tiers)[0] | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.score = Number(p['score']) || 0;
      this.total = Number(p['total']) || 10;
      this.difficulty = p['difficulty'] || 'medium';
      this.accuracy = Math.round((this.score / this.total) * 100);
      this.activeTier =
        this.tiers.find(
          (t) => this.accuracy >= t.min && this.accuracy <= t.max,
        ) ?? this.tiers[2];
    });
  }

  playAgain() {
    this.router.navigate(['/']);
  }

  retry() {
    this.router.navigate(['/game'], {
      queryParams: { difficulty: this.difficulty },
    });
  }
}
