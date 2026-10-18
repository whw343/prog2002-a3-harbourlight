import { DateTime } from 'luxon';

export class ApiError extends Error {
  constructor(public status:number, public code:string, message:string) { super(message); }
}
export function fail(message:string):never { throw new ApiError(400,'INVALID_INPUT',message); }
export function id(value:unknown):number {
  if(typeof value!=='string'|| !/^[1-9]\d*$/.test(value)||Number(value)>4294967295) fail('A valid positive event ID is required.');
  return Number(value);
}
export function text(value:unknown,label:string,max:number,min=1):string {
  if(typeof value!=='string'||value.trim().length<min||value.trim().length>max) fail(`${label} must contain ${min} to ${max} characters.`);
  return value.trim();
}
export function date(value:unknown):string {
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value)||!DateTime.fromISO(value).isValid) fail('Date must be a real date in YYYY-MM-DD format.');
  return value;
}
export function filters(query:Record<string,unknown>) {
  const result:{date?:string;location?:string;category?:number}={};
  for(const key of Object.keys(query)) if(!['date','location','category'].includes(key)) fail('Unknown search filter.');
  if(query.date!==undefined) result.date=date(query.date);
  if(query.location!==undefined) result.location=text(query.location,'Location',100);
  if(query.category!==undefined) result.category=id(query.category);
  return result;
}
export interface RegistrationInput {fullName:string;email:string;phone:string;ticketQuantity:number}
export function registration(body:any):RegistrationInput {
  const fullName=text(body?.fullName,'Full name',120,2);
  const email=text(body?.email,'Email',254).toLowerCase();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail('Enter a valid email address.');
  const phone=text(body?.phone,'Phone',30,6);
  if(!/^[+()\d\s.-]+$/.test(phone)||phone.replace(/\D/g,'').length<6) fail('Enter a valid contact phone number.');
  if(!Number.isInteger(body?.ticketQuantity)||body.ticketQuantity<1||body.ticketQuantity>20) fail('Ticket quantity must be a whole number from 1 to 20.');
  return {fullName,email,phone,ticketQuantity:body.ticketQuantity};
}
export interface EventInput {name:string;categoryId:number;organisationId:number;startAt:string;endAt:string;venue:string;city:string;purpose:string;description:string;ticketPrice:number;fundraisingGoal:number;amountRaised:number;isSuspended:boolean;latitude:number;longitude:number;imagePath:string}
export function eventInput(body:any):EventInput {
  const output:any={};
  for(const [key,label,max] of [['name','Event name',160],['venue','Venue',160],['city','City',100],['purpose','Purpose',255],['description','Description',10000]] as const) output[key]=text(body?.[key],label,max);
  for(const key of ['categoryId','organisationId']) output[key]=id(String(body?.[key]));
  for(const key of ['startAt','endAt']) {
    const raw=text(body?.[key],key,40);
    if(!/T\d{2}:\d{2}/.test(raw)) fail('Event dates must include a time.');
    const dt=DateTime.fromISO(raw,{zone:'Australia/Sydney'});
    if(!dt.isValid) fail('Enter valid event dates and times.');
    output[key]=dt.toUTC().toISO();
  }
  if(Date.parse(output.endAt)<=Date.parse(output.startAt)) fail('End time must be after start time.');
  for(const key of ['ticketPrice','fundraisingGoal','amountRaised']) {
    const val=body?.[key];
    if(typeof val!=='number'||!Number.isFinite(val)||val<0||val>99999999.99||Math.abs(Math.round(val*100)-val*100)>0.0001) fail('Amounts must be non-negative with no more than two decimal places.');
    output[key]=val;
  }
  if(typeof body?.isSuspended!=='boolean') fail('Suspended must be true or false.');
  output.isSuspended=body.isSuspended;
  for(const [key,limit] of [['latitude',90],['longitude',180]] as const) {
    if(typeof body?.[key]!=='number'||!Number.isFinite(body[key])||Math.abs(body[key])>limit) fail(`Enter a valid ${key}.`);
    output[key]=body[key];
  }
  const imagePath=body?.imagePath||'assets/community.svg';
  if(typeof imagePath!=='string'||!/^assets\/[a-z0-9-]+\.svg$/.test(imagePath)) fail('Choose a supplied event illustration.');
  output.imagePath=imagePath;
  return output as EventInput;
}
