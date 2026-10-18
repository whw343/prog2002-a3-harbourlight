import {DateTime} from 'luxon';
const cache=new Map<string,{until:number;value:any}>();
export function weatherDescription(code:number):string {
  if(code===0)return 'Clear sky';if([1,2,3].includes(code))return ['','Mainly clear','Partly cloudy','Overcast'][code];
  if([45,48].includes(code))return 'Fog';if([51,53,55,56,57].includes(code))return 'Drizzle';if([61,63,65,66,67].includes(code))return 'Rain';if([71,73,75,77].includes(code))return 'Snow';if([80,81,82].includes(code))return 'Rain showers';if([85,86].includes(code))return 'Snow showers';if([95,96,99].includes(code))return 'Thunderstorm';return 'Weather conditions unavailable';
}
export async function weather(event:{startAt:string;latitude:number;longitude:number},fetcher:typeof fetch=fetch) {
  const day=DateTime.fromISO(event.startAt).setZone('Australia/Sydney').toISODate()!;
  const today=DateTime.now().setZone('Australia/Sydney').startOf('day');
  const gap=DateTime.fromISO(day,{zone:'Australia/Sydney'}).diff(today,'days').days;
  if(gap<0||gap>15)return {available:false,reason:gap<0?'Forecast unavailable for a past event.':'Forecast available within 16 days of the event.',source:'Open-Meteo'};
  const key=`${event.latitude},${event.longitude},${day}`;
  const saved=cache.get(key);if(saved&&saved.until>Date.now())return saved.value;
  try {
    const url=new URL('https://api.open-meteo.com/v1/forecast');
    for(const [k,v] of Object.entries({latitude:String(event.latitude),longitude:String(event.longitude),daily:'weather_code,temperature_2m_max,temperature_2m_min',timezone:'Australia/Sydney',forecast_days:'16'}))url.searchParams.set(k,v);
    const response=await fetcher(url,{signal:AbortSignal.timeout(7000)});
    if(!response.ok)throw new Error('Weather upstream failed');
    const data:any=await response.json();const i=data.daily?.time?.indexOf(day);
    if(!(i>=0)||![data.daily.weather_code?.[i],data.daily.temperature_2m_max?.[i],data.daily.temperature_2m_min?.[i]].every(Number.isFinite))throw new Error('No forecast');
    const value={available:true,date:day,description:weatherDescription(data.daily.weather_code[i]),minC:data.daily.temperature_2m_min[i],maxC:data.daily.temperature_2m_max[i],source:'Open-Meteo',retrievedAt:new Date().toISOString()};
    if(cache.size>200)cache.clear();cache.set(key,{until:Date.now()+15*60000,value});return value;
  } catch {return {available:false,reason:'Weather service is temporarily unavailable. You can still register.',source:'Open-Meteo'};}
}
