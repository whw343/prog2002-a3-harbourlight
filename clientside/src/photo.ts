import {Directive,HostBinding,HostListener,Input} from '@angular/core';

/** Local photographs have a safe illustration fallback if an asset cannot load. */
@Directive({selector:'img[hlPhoto]'})
export class Photo {
  @HostBinding('attr.src') source='assets/community.svg';
  @HostBinding('attr.alt') @Input() alt='Community activity theme photograph';
  @Input() set hlPhoto(value:string|null|undefined){
    this.source=value&&/^assets\/(?:photos\/)?[a-z0-9-]+\.(?:svg|jpg)$/.test(value)?value:'assets/community.svg';
  }
  @HostListener('error') useFallback(){
    if(this.source!=='assets/community.svg'){
      this.source='assets/community.svg';
      this.alt='Community illustration; photograph unavailable';
    }
  }
}
