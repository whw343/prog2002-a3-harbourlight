import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registration,filters,id,date} from '../src/validation';
import {weather,weatherDescription} from '../src/weather';
import {DateTime} from 'luxon';

test('Registration rejects malformed inputs and normalizes the user identity',()=>{
  const valid={fullName:'Avery Test',email:' Avery@Example.invalid ',phone:'+61 400 000 000',ticketQuantity:2};
  assert.equal(registration(valid).email,'avery@example.invalid');
  for(const value of [0,-1,1.5,21,'2',null])assert.throws(()=>registration({...valid,ticketQuantity:value}));
  assert.throws(()=>registration({...valid,email:'missing-at'}));
  assert.throws(()=>registration({...valid,phone:'abcabc'}));
});
test('Filters reject ambiguous input and invalid calendar dates',()=>{
  assert.equal(date('2028-02-29'),'2028-02-29');
  for(const v of ['2026-02-29','2026-13-01','2026-01-32'])assert.throws(()=>date(v));
  for(const v of ['0','-1','1e2','abc','4294967296'])assert.throws(()=>id(v));
  assert.throws(()=>filters({date:['2026-01-01','2026-02-01']}));
  assert.throws(()=>filters({unrecognized:'x'}));
  assert.deepEqual(filters({location:' Sydney ',category:'1'}),{location:'Sydney',category:1});
});
test('Weather maps provider codes without copying the brief typo',()=>{
  assert.equal(weatherDescription(3),'Overcast');assert.equal(weatherDescription(95),'Thunderstorm');
  assert.equal(weatherDescription(999),'Weather conditions unavailable');
});
test('Out-of-range event dates do not request an unrelated forecast',async()=>{
  let calls=0;const request=(async()=>{calls++;throw Error();}) as typeof fetch;
  const result=await weather({startAt:DateTime.now().plus({days:40}).toISO()!,latitude:0,longitude:0},request);
  assert.equal(result.available,false);assert.equal(calls,0);
});
test('Weather failure degrades without blocking registration',async()=>{
  const result=await weather({startAt:DateTime.now().plus({days:2}).toISO()!,latitude:1,longitude:1},(async()=>{throw Error('offline');}) as typeof fetch);
  assert.equal(result.available,false);assert.match(result.reason!,/still register/);
});
test('Weather selects the event date from the provider response',async()=>{
  const startAt=DateTime.now().plus({days:3}).toISO()!;
  const day=DateTime.fromISO(startAt).setZone('Australia/Sydney').toISODate();
  const result=await weather({startAt,latitude:2,longitude:2},(async()=>new Response(JSON.stringify({daily:{time:['2000-01-01',day],weather_code:[95,3],temperature_2m_min:[-5,16],temperature_2m_max:[-1,24]}}),{status:200})) as typeof fetch);
  assert.equal(result.available,true);assert.equal(result.description,'Overcast');assert.equal(result.minC,16);assert.equal(result.maxC,24);
});
