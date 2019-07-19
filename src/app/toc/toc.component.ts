import { Component, OnInit, Input } from '@angular/core';
import { TocService } from '../toc.service';
import { TocNode } from '../toc-node';


/**
 * Todos:
 *  - Fetch products and versions (dropdown + autocomplete)
 *  - Improve performance for expand all
 *  - Prettify the page
 *  - Second load should interrupt the first one
 */
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
