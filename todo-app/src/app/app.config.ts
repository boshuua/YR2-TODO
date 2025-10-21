import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DragulaModule } from 'ng2-dragula'; // <-- NEW: Import Dragula

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Replace the old module with DragulaModule
    importProvidersFrom(FormsModule, DragulaModule.forRoot()) 
  ]
};