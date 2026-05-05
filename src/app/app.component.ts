import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StartPageComponent } from './start-page/start-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StartPageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'realitycheck';
}
