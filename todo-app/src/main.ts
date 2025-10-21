import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app'; // <-- Changed 'App' to 'AppComponent'

bootstrapApplication(AppComponent, appConfig) // <-- Changed 'App' to 'AppComponent'
  .catch((err) => console.error(err));
