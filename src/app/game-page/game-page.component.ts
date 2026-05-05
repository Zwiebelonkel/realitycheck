import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImagePoolService, MediaItem } from '../services/image-pool.service';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-page.component.html',
  styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
  difficulty: string = 'medium';
  currentIndex = 0;
  totalRounds = 10;
  score = 0;
  results: boolean[] = [];
  wrongGuessHint = '';

  swipeState: 'idle' | 'left' | 'right' = 'idle';
  feedbackState: 'none' | 'correct' | 'wrong' = 'none';
  feedbackLabel = '';
  isTransitioning = false;

  dragStartX = 0;
  dragCurrentX = 0;
  isDragging = false;
  dragOffset = 0;

  items: MediaItem[] = [];

  get currentItem(): MediaItem {
    return this.items[this.currentIndex];
  }

  get progressPercent(): number {
    return (this.currentIndex / this.totalRounds) * 100;
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private imagePoolService: ImagePoolService,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.difficulty = p['difficulty'] || 'medium';
      this.initializeItems();
    });
  }

  ngOnDestroy() {}

  initializeItems() {
    this.items = this.imagePoolService.createRoundItems(this.difficulty, this.totalRounds);
    this.currentIndex = 0;
    this.score = 0;
    this.results = [];
    this.wrongGuessHint = '';
  }


  guessReal() { this.processGuess(true); }
  guessAI() { this.processGuess(false); }

  processGuess(guessedReal: boolean) {
    if (this.isTransitioning) return;
    const correct = guessedReal === this.currentItem.isReal;

    this.swipeState = guessedReal ? 'right' : 'left';
    this.feedbackState = correct ? 'correct' : 'wrong';
    this.feedbackLabel = correct ? 'CORRECT' : 'WRONG';
    this.wrongGuessHint = correct ? '' : this.currentItem.hint;

    if (correct) this.score++;
    this.results.push(correct);
    this.isTransitioning = true;

    setTimeout(() => this.advance(), 1100);
  }

  advance() {
    this.swipeState = 'idle';
    this.feedbackState = 'none';
    this.dragOffset = 0;
    this.isTransitioning = false;
    this.wrongGuessHint = '';

    if (this.currentIndex >= this.totalRounds - 1) {
      this.router.navigate(['/results'], {
        queryParams: { score: this.score, total: this.totalRounds, difficulty: this.difficulty },
      });
    } else {
      this.currentIndex++;
    }
  }

  onTouchStart(e: TouchEvent) { this.dragStartX = e.touches[0].clientX; this.isDragging = true; }
  onTouchMove(e: TouchEvent) { if (!this.isDragging) return; this.dragCurrentX = e.touches[0].clientX; this.dragOffset = this.dragCurrentX - this.dragStartX; }
  onTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const threshold = 80;
    if (this.dragOffset > threshold) { this.dragOffset = 0; this.guessReal(); }
    else if (this.dragOffset < -threshold) { this.dragOffset = 0; this.guessAI(); }
    else { this.dragOffset = 0; }
  }

  onMouseDown(e: MouseEvent) { this.dragStartX = e.clientX; this.isDragging = true; }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) { if (!this.isDragging) return; this.dragCurrentX = e.clientX; this.dragOffset = this.dragCurrentX - this.dragStartX; }
  @HostListener('document:mouseup')
  onMouseUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    const threshold = 80;
    if (this.dragOffset > threshold) { this.dragOffset = 0; this.guessReal(); }
    else if (this.dragOffset < -threshold) { this.dragOffset = 0; this.guessAI(); }
    else { this.dragOffset = 0; }
  }

  get cardStyle() {
    if (this.swipeState !== 'idle') return {};
    const rotate = this.dragOffset * 0.04;
    return { transform: `translateX(${this.dragOffset}px) rotate(${rotate}deg)`, transition: this.isDragging ? 'none' : 'transform 0.3s ease' };
  }

  get hintOpacity(): number { return Math.min(Math.abs(this.dragOffset) / 80, 1); }
  get hintDirection(): 'left' | 'right' | 'none' {
    if (this.dragOffset > 20) return 'right';
    if (this.dragOffset < -20) return 'left';
    return 'none';
  }
}
