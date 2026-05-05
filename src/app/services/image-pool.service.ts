import { Injectable } from '@angular/core';

export interface MediaItem {
  url: string;
  isReal: boolean;
  hint: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImagePoolService {
  private readonly aiByDifficulty: Record<string, MediaItem[]> = {
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

  private readonly realItems: MediaItem[] = [
    { url: 'images/real/real-portrait-1.svg', isReal: true, hint: 'Kleine Unregelmäßigkeiten in Licht und Hauttönen sprechen für ein echtes Foto.' },
    { url: 'images/real/real-street-2.svg', isReal: true, hint: 'Perspektive und Schatten folgen einer konsistenten Szene.' },
    { url: 'images/real/real-food-3.svg', isReal: true, hint: 'Texturen sind variabel und nicht gleichförmig geglättet.' },
  ];

  createRoundItems(difficulty: string, totalRounds: number): MediaItem[] {
    const aiPool = this.aiByDifficulty[difficulty] ?? this.aiByDifficulty['medium'];
    const all = [...aiPool, ...this.realItems];

    const picks: MediaItem[] = [];
    for (let i = 0; i < totalRounds; i++) {
      const randomItem = all[Math.floor(Math.random() * all.length)];
      picks.push({ ...randomItem });
    }

    return picks;
  }
}
