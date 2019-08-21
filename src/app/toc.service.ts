import { Injectable } from '@angular/core';
import { TocNode } from './toc-node';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  proxy = 'https://custom-cors-anywhere.herokuapp.com/'; // Use 'https://cors-anywhere.herokuapp.com/' to run locally.

  constructor(
    private http: HttpClient
  ) { }

  buildTocTree(product: string, version: string): Observable<TocNode> {
    const helpUrl = 'https://help.sap.com/http.svc/productpagedeprecated?locale=en-US&product=';
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

        if (pages.length === 0) {
          observable.complete();
        }

        let loadedPages = 0;
        for (const page of pages) {
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
            if (loadedPages === pages.length) {
              observable.complete();
            }
          });
        }
      });
    });
  }

  createTocNode(item, parentUrl, version, parentTitle): TocNode {
    const url = 'https://help.sap.com/viewer/' + parentUrl + '/' + version + '/en-US/' + item.u;
    const tocNode: TocNode = {
      name: item.t,
      link: url,
      visible: false,
      children: [],
      title: parentTitle + item.t
    };
    for (const child of item.c) {
      tocNode.children.push(this.createTocNode(child, parentUrl, version, tocNode.title + ' >\n'));
    }
    return tocNode;
  }

  fetchProducts() {
    const url = this.proxy + 'https://help.sap.com/http.svc/search?area=browser&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        map(res => {
          const products = [];
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

  fetchVersions(product: string) {
    const url = this.proxy + 'https://help.sap.com/http.svc/filter?element=version&product=' + product + '&state=PRODUCTION';
    return this.http.get(url)
      .pipe(
        share(),
        map(res => {
          const versions = (res as any).data.version;
          const sortedVersions = this.sortVersions(versions.map(obj => obj.key));
          const keys = sortedVersions.map(key => {
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
