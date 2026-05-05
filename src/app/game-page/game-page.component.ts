import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

interface MediaItem {
  url: string;
  isReal: boolean;
  hint: string;
}

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

  readonly aiByDifficulty: Record<string, MediaItem[]> = {
    easy: [
      { url: 'images/ai/easy/ai-easy-1.svg', isReal: false, hint: 'Die Farben sind unnatürlich gesättigt und die Formen zu perfekt.' },
      { url: 'images/ai/easy/ai-easy-2.svg', isReal: false, hint: 'Kanten und Strukturen wirken wie gemalt statt fotografiert.' },
    ],
    medium: [
      { url: 'images/ai/medium/ai-medium-1.svg', isReal: false, hint: 'Das Bild hat gleichmäßige Textur ohne echte Kamerakörnung.' },
      { url: 'images/ai/medium/ai-medium-2.svg', isReal: false, hint: 'Licht und Schatten passen nicht ganz natürlich zusammen.' },
    ],
    hard: [
      { url: 'images/ai/hard/ai-hard-1.svg', isReal: false, hint: 'Viele Details wiederholen sich in einem erkennbaren Muster.' },
      { url: 'images/ai/hard/ai-hard-2.svg', isReal: false, hint: 'Gesichtsproportionen sind knapp daneben und wirken synthetisch.' },
    ],
  };

  readonly realItems: MediaItem[] = [
    { url: 'images/real/real-portrait-1.svg', isReal: true, hint: 'Kleine Unregelmäßigkeiten in Licht und Hauttönen sprechen für ein echtes Foto.' },
    { url: 'images/real/real-street-2.svg', isReal: true, hint: 'Perspektive und Schatten folgen einer konsistenten Szene.' },
    { url: 'images/real/real-food-3.svg', isReal: true, hint: 'Texturen sind variabel und nicht gleichförmig geglättet.' },
  ];

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
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((p) => {
      this.difficulty = p['difficulty'] || 'medium';
      this.initializeItems();
    });
  }

  ngOnDestroy() {}

  initializeItems() {
    const aiPool = this.aiByDifficulty[this.difficulty] ?? this.aiByDifficulty['medium'];
    const combined: MediaItem[] = [];

    for (let i = 0; i < this.totalRounds; i++) {
      const sourcePool = i % 2 === 0 ? aiPool : this.realItems;
      combined.push({ ...sourcePool[i % sourcePool.length] });
    }

    this.items = this.shuffle(combined);
    this.currentIndex = 0;
    this.score = 0;
    this.results = [];
    this.wrongGuessHint = '';
  }

  shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
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
