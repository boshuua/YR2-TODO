import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { config } from './app/app.config.server'; // We import the server config

// This bootstraps the app using the server-specific config
const bootstrap = () => bootstrapApplication(AppComponent, config); 

export default bootstrap;