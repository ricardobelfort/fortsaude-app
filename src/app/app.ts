import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<div class="min-h-screen overflow-y-auto overflow-x-hidden">
    <router-outlet></router-outlet>
  </div>`,
  styleUrl: './app.css',
})
export class App {}
