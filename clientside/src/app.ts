import {Component,inject,signal,computed,DestroyRef} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule,NgForm} from '@angular/forms';
import {ActivatedRoute,Router,RouterLink,RouterLinkActive,RouterOutlet,Routes} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Api,EventRecord,Option,Weather,message} from './data';
import {SydneyDatePipe} from './sydney-date';

@Component({selector:'event-card',imports:[CommonModule,SydneyDatePipe,RouterLink],inputs:['event'],template:`<article class="event-card"><a [routerLink]="['/events',event.id]" class="card-image" [attr.aria-label]="event.name"><img [src]="event.imagePath || 'assets/community.svg'" alt="" loading="lazy"><span class="date-stamp"><b>{{event.startAt | syd:'dd':'Australia/Sydney'}}</b>{{event.startAt | syd:'MMM':'Australia/Sydney'}}</span></a><div class="card-body"><span class="eyebrow">{{event.category.name}}</span><h3><a [routerLink]="['/events',event.id]">{{event.name}}</a></h3><p class="muted">{{event.city}} · {{event.venue}}</p><p>{{event.purpose}}</p><div class="card-bottom"><strong>{{event.ticketPrice===0?'Free entry':(event.ticketPrice | currency:'AUD':'symbol-narrow')}}</strong><a [routerLink]="['/events',event.id]" class="text-link">View event <span aria-hidden="true">↗</span></a></div></div></article>`})
export class EventCard {event!:EventRecord;}

@Component({imports:[CommonModule,RouterLink,EventCard],templateUrl:'./home.html'})
export class Home {
  api=inject(Api);events=signal<EventRecord[]>([]);error=signal('');loading=signal(true);
  constructor(){void this.load();}
  async load(){this.loading.set(true);this.error.set('');try{this.events.set(await this.api.get('/events'));}catch(e){this.error.set(message(e));}finally{this.loading.set(false);}}
}
@Component({imports:[CommonModule,FormsModule,EventCard],templateUrl:'./search.html'})
export class Search {
  api=inject(Api);route=inject(ActivatedRoute);router=inject(Router);destroy=inject(DestroyRef);
  events=signal<EventRecord[]>([]);categories=signal<Option[]>([]);loading=signal(true);error=signal('');optionError=signal('');date='';location='';category='';private request=0;
  constructor(){void this.loadOptions();this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(p=>{this.date=p.get('date')||'';this.location=p.get('location')||'';this.category=p.get('category')||'';void this.load();});}
  async loadOptions(){try{this.categories.set(await this.api.get('/categories'));this.optionError.set('');}catch(e){this.optionError.set(message(e));}}
  async load(){const version=++this.request;this.loading.set(true);this.error.set('');const p:Record<string,string>={};if(this.date)p['date']=this.date;if(this.location.trim())p['location']=this.location.trim();if(this.category)p['category']=this.category;try{const rows=await this.api.get<EventRecord[]>('/events',p);if(version===this.request)this.events.set(rows);}catch(e){if(version===this.request)this.error.set(message(e));}finally{if(version===this.request)this.loading.set(false);}}
  search(){void this.router.navigate(['/search'],{queryParams:{date:this.date||null,location:this.location.trim()||null,category:this.category||null}});void this.load();}
  clear(){this.date='';this.location='';this.category='';this.search();}
}
@Component({imports:[CommonModule,SydneyDatePipe,RouterLink],templateUrl:'./detail.html'})
export class Detail {
  api=inject(Api);route=inject(ActivatedRoute);destroy=inject(DestroyRef);event=signal<EventRecord|null>(null);forecast=signal<Weather|null>(null);error=signal('');loading=signal(true);weatherLoading=signal(false);private version=0;
  progress=computed(()=>{const e=this.event();return e&&e.fundraisingGoal>0?Math.min(100,e.amountRaised/e.fundraisingGoal*100):0;});
  constructor(){this.route.paramMap.pipe(takeUntilDestroyed(this.destroy)).subscribe(()=>void this.load());}
  async load(){const version=++this.version;this.loading.set(true);this.error.set('');this.event.set(null);this.forecast.set(null);const id=this.route.snapshot.paramMap.get('id');try{const event=await this.api.get<EventRecord>('/events/'+id);if(version!==this.version)return;this.event.set(event);void this.loadWeather(event.id,version);}catch(e){if(version===this.version)this.error.set(message(e));}finally{if(version===this.version)this.loading.set(false);}}
  async loadWeather(id:number,version=this.version){this.weatherLoading.set(true);try{const w=await this.api.get<Weather>(`/events/${id}/weather`);if(version===this.version)this.forecast.set(w);}catch{if(version===this.version)this.forecast.set({available:false,source:'Open-Meteo',reason:'Weather service is temporarily unavailable. You can still register.'});}finally{if(version===this.version)this.weatherLoading.set(false);}}
}
@Component({imports:[CommonModule,SydneyDatePipe,FormsModule,RouterLink],templateUrl:'./register.html'})
export class Register {
  api=inject(Api);route=inject(ActivatedRoute);event=signal<EventRecord|null>(null);error=signal('');loading=signal(true);sending=signal(false);confirmed=signal<number|null>(null);fullName='';email='';phone='';ticketQuantity=1;
  constructor(){void this.load();}
  async load(){this.loading.set(true);this.error.set('');try{this.event.set(await this.api.get('/events/'+this.route.snapshot.paramMap.get('id')));}catch(e){this.error.set(message(e));}finally{this.loading.set(false);}}
  async submit(form:NgForm){this.error.set('');if(form.invalid){form.control.markAllAsTouched();this.error.set('Please correct the highlighted fields.');return;}if(this.sending()||!this.event()?.canRegister)return;this.sending.set(true);try{const data=await this.api.send<{id:number}>('POST',`/events/${this.event()!.id}/registrations`,{fullName:this.fullName,email:this.email,phone:this.phone,ticketQuantity:Number(this.ticketQuantity)});this.confirmed.set(data.id);}catch(e){this.error.set(message(e));}finally{this.sending.set(false);}}
}
@Component({selector:'app-root',imports:[RouterOutlet,RouterLink,RouterLinkActive],template:`<a class="skip" href="#main">Skip to content</a><header><div class="nav-wrap"><a class="brand" routerLink="/" aria-label="Harbourlight home"><span class="brand-mark" aria-hidden="true">✳</span><span>harbourlight<small>COMMUNITY, TOGETHER.</small></span></a><nav aria-label="Main navigation"><a routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active">Home</a><a routerLink="/search" routerLinkActive="active">Find an event</a></nav></div></header><main id="main" tabindex="-1"><router-outlet /></main><footer><div class="footer-inner"><a class="brand" routerLink="/">✳ harbourlight</a><p>Small moments. Stronger communities.</p><a href="mailto:hello@example.invalid">hello&#64;example.invalid</a><small>Fictional community project · Demonstration registrations only</small></div></footer>`})
export class App {}
@Component({imports:[RouterLink],template:`<section class="section container"><h1>Page not found</h1><p>Let’s get you back to the community.</p><a routerLink="/" class="button">Back home</a></section>`})export class NotFound{}
export const routes:Routes=[{path:'',component:Home},{path:'search',component:Search},{path:'events/:id',component:Detail},{path:'register/:id',component:Register},{path:'**',component:NotFound}];
