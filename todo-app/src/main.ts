import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import { importProvidersFrom } from '@angular/core'; // <-- Import this
import { FormsModule } from '@angular/forms'; // <-- Import this

// We merge the shared config with the browser-only FormsModule
bootstrapApplication(AppComponent, {
  ...appConfig, 
  providers: [
    ...appConfig.providers, 
    importProvidersFrom(FormsModule) // <-- Add FormsModule ONLY here
  ]
})
  .catch((err) => console.error(err));