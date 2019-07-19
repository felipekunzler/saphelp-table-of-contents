import { Injectable } from '@angular/core';
import { TocNode } from './toc-node';
import { Observable, observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  constructor(
    private http: HttpClient
  ) { }

  buildTocTree(code: string, version: string): Observable<TocNode> {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    version = '1905'; // E.g. SHIP
    code = 'SAP_COMMERCE'; // E.g. SAP_COMMERCE_CLOUD_PUBLIC_CLOUD
    const product = code;

    const helpUrl = 'https://help.sap.com/http.svc/productpage?locale=en-US&onlyproduct=false&product=';
    const baseUrl = proxy + helpUrl + product + '&state=PRODUCTION&version=' + version;

    return new Observable<TocNode>(observable => {
      const resp = this.http.get(baseUrl);
      resp.subscribe(json => {
        const pages = json.data.deliverables
          .filter(d => d.transtype === 'html5.uacp')
          .sort((a, b) => b.title.localeCompare(a.title))
          .map(d => proxy + 'https://help.sap.com/http.svc/pagecontent?deliverable_id=' + d.id + '&deliverable_loio=' + d.loio);

        for (const page of pages) {
          this.http.get(page).subscribe(pageJson => {
            const pageToc = pageJson.data.deliverable.fullToc;
            const item = pageToc[0];
            const loio = pageJson.data.deliverable.loio;

            const tocNode = this.createTocNode(item);
            tocNode.visible = true;
            tocNode.children.forEach(child => child.visible = true);
            observable.next(tocNode);
          });
        }
      });
    });
  }

  createTocNode(item): TocNode {
    const tocNode: TocNode = {
      name: item.t,
      visible: false,
      children: []
    };
    for (const child of item.c) {
      tocNode.children.push(this.createTocNode(child));
    }
    return tocNode;
  }

}
