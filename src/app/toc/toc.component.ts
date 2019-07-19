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

  onExpandClick(link: TocNode) {
    link.children.forEach(node => {
      node.visible = true;
    });
  }

  onExpandAllClick(link: TocNode) {
    this.tocService.onExpandAllClick(link);
  }

  onCollapseAllClick(link: TocNode) {
    this.tocService.onCollapseAllClick(link);
  }

}
