import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config'; // Imports the shared config

// This is the clean server config
export const config: ApplicationConfig = {
  ...appConfig,
  providers: [
    provideServerRendering()
  ]
};