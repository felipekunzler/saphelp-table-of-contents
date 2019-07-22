import { Injectable } from '@angular/core';
import { TocNode } from './toc-node';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  proxy = 'https://custom-cors-anywhere.herokuapp.com/';

  constructor(
    private http: HttpClient
  ) { }

  buildTocTree(product: string, version: string): Observable<TocNode> {
    const helpUrl = 'https://help.sap.com/http.svc/productpage?locale=en-US&onlyproduct=false&product=';
    const baseUrl = this.proxy + helpUrl + product + '&state=PRODUCTION&version=' + version;

    return new Observable<TocNode>(observable => {
      const resp = this.http.get(baseUrl);
      resp.subscribe(json => {
        if (!(json as any).data.deliverables) {
          observable.complete();
          return;
        }

        const pages = (json as any).data.deliverables
          .filter(d => d.transtype === 'html5.uacp')
          .map(d => this.proxy + 'https://help.sap.com/http.svc/pagecontent?deliverable_id=' + d.id + '&deliverable_loio=' + d.loio);

        let loadedPages = 0;
        for (const page of pages) {
          this.http.get(page).subscribe(pageJson => {
            const pageToc = (pageJson as any).data.deliverable.fullToc;
            const item = pageToc[0];
            const loio = (pageJson as any).data.deliverable.loio;

            const tocNode = this.createTocNode(item, loio, version);
            tocNode.visible = true;
            tocNode.children.forEach(child => child.visible = true);

            observable.next(tocNode);
            loadedPages++;
            if (loadedPages === pages.length) {
              observable.complete();
            }
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

  fetchProducts() {
    const url = this.proxy + 'https://help.sap.com/http.svc/search?area=browser&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        map(res => {
          const products = [];
          for (const product of res.data.products) {
            products.push({
              name: product.title,
              code: product.url.slice(10, product.url.length)
            });
          }
          return products;
        })
      );
  }

  fetchVersions(product: string) {
    const url = this.proxy + 'https://help.sap.com/http.svc/filter?element=version&product=' + product + '&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        map(res => res.data.version)
      );
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
