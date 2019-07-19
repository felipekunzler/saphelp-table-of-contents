import { Component, OnInit, Input } from '@angular/core';
import { TocService } from '../toc.service';
import { TocNode } from '../toc-node';

@Component({
  selector: 'app-toc',
  templateUrl: './toc.component.html',
  styleUrls: ['./toc.component.scss']
})
export class TocComponent {

  @Input()
  link: TocNode;

  constructor(
    private tocService: TocService
  ) { }

  onExpandClick() {
    if (this.link.children) {
      this.link.children[0].children[0].visible = true;
    }
  }

  onExpandAllClick() {
    if (this.link.children) {
      this.link.children[0].children[0].visible = true;
    }
  }

  onCollapseAllClick() {
    // for each children then call it again recursively.
    if (this.link.children) {
      this.link.children[0].visible = false;
    }
  }

}
