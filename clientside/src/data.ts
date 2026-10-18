import {inject,Injectable} from '@angular/core';
import {HttpClient,HttpParams,HttpErrorResponse} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
export interface Registration {id:number;fullName:string;ticketQuantity:number;registeredAt:string;email?:string;phone?:string}
export interface EventRecord {id:number;name:string;startAt:string;endAt:string;venue:string;city:string;purpose:string;description:string;ticketPrice:number;fundraisingGoal:number;amountRaised:number;category:{id:number;name:string};organisation:{id:number;name:string};status:string;isSuspended:boolean;canRegister:boolean;latitude:number;longitude:number;imagePath:string;registrations:Registration[];registrationCount?:number}
export interface Option {id:number;name:string}
export interface Weather {available:boolean;reason?:string;date?:string;description?:string;minC?:number;maxC?:number;source:string;retrievedAt?:string}
declare global {interface Window {HARBOURLIGHT_CONFIG?:{apiBase:string}}}
export const config=window.HARBOURLIGHT_CONFIG||{apiBase:'/api'};
@Injectable({providedIn:'root'})
export class Api {
  private http=inject(HttpClient);private base=config.apiBase.replace(/\/$/,'');
  async get<T>(path:string,params:Record<string,string>={}):Promise<T>{const result=await firstValueFrom(this.http.get<{data:T}>(this.base+path,{params:new HttpParams({fromObject:params})}));return result.data;}
  async send<T>(method:string,path:string,body?:unknown):Promise<T>{const result=await firstValueFrom(this.http.request<{data:T}>(method,this.base+path,{body}));return result?.data;}
}
export function message(error:unknown):string {return error instanceof HttpErrorResponse?error.error?.error?.message||'The service is unavailable. Please try again.':'Something went wrong. Please try again.';}
