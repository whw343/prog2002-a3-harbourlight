import {Pipe,PipeTransform} from '@angular/core';
// Angular DatePipe accepts offsets; Intl handles the IANA zone and daylight saving.
@Pipe({name:'syd'})
export class SydneyDatePipe implements PipeTransform {
  transform(value:string,format='d MMM y',_zone?:string):string {
    const dt=new Date(value);if(!Number.isFinite(dt.valueOf()))return '';
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',year:'numeric',month:'short',day:'2-digit',weekday:'long',hour:'numeric',minute:'2-digit',hour12:true}).formatToParts(dt).map(x=>[x.type,x.value]));
    if(format==='dd')return parts['day'];
    if(format==='MMM')return parts['month'];
    const day=String(Number(parts['day']));const time=parts['hour']+':'+parts['minute']+' '+parts['dayPeriod'].toLowerCase();
    if(format==='h:mm a')return time;
    if(format==='d MMM, h:mm a')return `${day} ${parts['month']}, ${time}`;
    const fullMonth=new Intl.DateTimeFormat('en-AU',{timeZone:'Australia/Sydney',month:'long'}).format(dt);
    if(format==='EEEE, d MMMM y')return `${parts['weekday']}, ${day} ${fullMonth} ${parts['year']}`;
    if(format==='EEEE, d MMM y')return `${parts['weekday']}, ${day} ${parts['month']} ${parts['year']}`;
    return `${day} ${parts['month']} ${parts['year']}`+(format.includes('h:mm')?', '+time:'');
  }
}
