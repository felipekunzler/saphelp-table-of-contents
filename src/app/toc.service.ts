import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  constructor() { }

  buildTocTree(code, version) {
    console.log('got', code, version);
  }

}
