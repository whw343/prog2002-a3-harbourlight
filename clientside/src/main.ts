import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter,withHashLocation,withInMemoryScrolling} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {App,routes} from './app';
bootstrapApplication(App,{providers:[provideHttpClient(),provideRouter(routes,withHashLocation(),withInMemoryScrolling({scrollPositionRestoration:'top'}))]}).catch(console.error);
