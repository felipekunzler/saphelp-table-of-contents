import { Injectable } from '@angular/core';
import { Product, TocNode, Version } from './types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  readonly proxy = 'https://custom-cors-anywhere.herokuapp.com/';
  readonly helpBaseUrl = 'https://help.sap.com';

  constructor(
    private http: HttpClient
  ) { }

  buildTocTree(product: string, version: string): Observable<TocNode> {
    const helpUrl = this.helpBaseUrl + '/http.svc/productpage?locale=en-US&product=';
    const url = this.proxy + helpUrl + product + '&state=PRODUCTION&version=' + version;

    return new Observable<TocNode>(observable => {
      const resp = this.http.get(url);
      resp.subscribe(json => {
        if (!(json as any).data.kpTasks) {
          observable.complete();
          return;
        }

        const rootPages = (json as any).data.kpTasks
          .flatMap(task => task.contentCategories)
          .flatMap(category => category.links)
          .filter(link => link.format === 'html5.uacp')
          .map(link => link.href.split('/')[2])
          .map(loio => this.proxy + this.helpBaseUrl + '/http.svc/getpagecontent?deliverableInfo=1&deliverable_loio='
                                  + loio + '&language=en-US&state=PRODUCTION&toc=1&version=' + version);

        if (rootPages.length === 0) {
          observable.complete();
        }

        let loadedPages = 0;
        for (const rootPage of rootPages) {
          this.http.get(rootPage).subscribe(rootPageJson => {
            const page = this.proxy + this.helpBaseUrl + '/http.svc/pagecontent?deliverableInfo=1&deliverable_id='
                                    + (rootPageJson as any).data.deliverable.id;

            this.http.get(page).subscribe(pageJson => {
              const pageToc = (pageJson as any).data.deliverable.fullToc;

              const root = {
                u: '',
                t: (pageJson as any).data.deliverable.title,
                c: pageToc
              };
              const item = pageToc.length > 1 ? root : pageToc[0];
              const loio = (pageJson as any).data.deliverable.loio;

              const tocNode = this.createTocNode(item, loio, version, '');
              tocNode.visible = true;
              tocNode.children.forEach(child => child.visible = true);

              observable.next(tocNode);
              loadedPages++;
              if (loadedPages === rootPages.length) {
                observable.complete();
              }
            });

          });
        }
      });
    });
  }

  createTocNode(item, parentUrl, version, parentTitle): TocNode {
    const url = this.helpBaseUrl + '/viewer/' + parentUrl + '/' + version + '/en-US/' + item.u;
    const tocNode: TocNode = {
      name: item.t,
      link: url,
      visible: false,
      children: [],
      title: parentTitle + item.t
    };
    for (const child of item.c) {
      const nextTitle = parentTitle === '' ? '> ' + tocNode.title + '\n> ' : tocNode.title + '\n> ';
      tocNode.children.push(this.createTocNode(child, parentUrl, version, nextTitle));
    }
    return tocNode;
  }

  fetchProducts(): Observable<Product[]> {
    const url = this.proxy + this.helpBaseUrl + '/http.svc/search?area=browser&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        share(),
        map(res => {
          const products: Product[] = [];
          for (const product of (res as any).data.products) {
            products.push({
              name: product.title,
              code: product.url.slice(10, product.url.length)
            });
          }
          return products;
        })
      );
  }

  fetchVersions(product: string): Observable<Version[]> {
    const url = this.proxy + this.helpBaseUrl + '/http.svc/filter?element=version&product=' + product + '&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        share(),
        map(res => {
          const versions = (res as any).data.version;
          const sortedVersions = this.sortVersions(versions.map(obj => obj.key));
          const keys: Version[] = sortedVersions.map(key => {
            return {
              key,
              value: versions.find(o => o.key === key).value
            };
          });
          return keys;
        })
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

  /**
   * Version sort from help.sap.com
   */
  sortVersions(e) {
    for (var t: any = [], n = [], r = 0, a = 0; a < e.length; a++) {
      var i = e[a];
      if (!/^(\d+\.)*\d+$/.test(i)) {
        var t = e.sort().reverse();
        return t.slice(0)
      }
      for (var o = i.split("."), s = 0; s < o.length; s++)
        o[s] = parseInt(o[s]);
      var l = {
        version: i,
        tokens: o
      };
      o.length > r && (r = o.length),
        n.push(l)
    }
    for (a = 0; a < n.length; a++)
      for (; n[a].tokens.length < r;)
        n[a].tokens.push(0);
    return n.sort(function (e, t) {
      for (var n = e.tokens, r = t.tokens, a = 0; a < n.length; a++) {
        if (n[a] === r[a] && a === n.length - 1)
          return 0;
        if (n[a] !== r[a])
          return n[a] > r[a] ? -1 : 1
      }
    }),
      t = n.map(function (e) {
        return e.version
      }),
      t.slice(0)
  }

}
