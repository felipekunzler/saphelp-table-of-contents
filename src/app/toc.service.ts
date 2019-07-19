import { Injectable } from '@angular/core';
import { TocNode } from './toc-node';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  constructor(
    private http: HttpClient
  ) { }

  buildTocTree(product: string, version: string): Observable<TocNode> {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    const helpUrl = 'https://help.sap.com/http.svc/productpage?locale=en-US&onlyproduct=false&product=';
    const baseUrl = proxy + helpUrl + product + '&state=PRODUCTION&version=' + version;

    return new Observable<TocNode>(observable => {
      const resp = this.http.get(baseUrl);
      resp.subscribe(json => {
        const pages = (json as any).data.deliverables
          .filter(d => d.transtype === 'html5.uacp')
          .map(d => proxy + 'https://help.sap.com/http.svc/pagecontent?deliverable_id=' + d.id + '&deliverable_loio=' + d.loio);

        for (const page of pages) {
          this.http.get(page).subscribe(pageJson => {
            const pageToc = (pageJson as any).data.deliverable.fullToc;
            const item = pageToc[0];
            const loio = (pageJson as any).data.deliverable.loio;

            const tocNode = this.createTocNode(item, loio, version);
            tocNode.visible = true;
            tocNode.children.forEach(child => child.visible = true);

            observable.next(tocNode);
          });
        }
      });
    });
  }

  createTocNode(item, parentUrl, version): TocNode {
    const url = 'https://help.sap.com/viewer/' + parentUrl + '/' + version + '/en-US/' + item.u;
    const tocNode: TocNode = {
      name: item.t,
      link: url,
      visible: false,
      children: []
    };
    for (const child of item.c) {
      tocNode.children.push(this.createTocNode(child, parentUrl, version));
    }
    return tocNode;
  }

  onExpandAllClick(link: TocNode) {
    link.children.forEach(node => {
      node.visible = true;
      this.onExpandAllClick(node);
    });
  }

  onCollapseAllClick(link: TocNode) {
    link.children.forEach(node => {
      node.visible = false;
      this.onCollapseAllClick(node);
    });
  }

}
