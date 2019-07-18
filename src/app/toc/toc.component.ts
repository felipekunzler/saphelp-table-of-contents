import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toc',
  templateUrl: './toc.component.html',
  styleUrls: ['./toc.component.scss']
})
export class TocComponent implements OnInit {

  links = ['abc', 'dce'];

  constructor() { }

  ngOnInit() {
  }

}
