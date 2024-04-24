import { Injectable } from '@angular/core';
import { Product, TocNode, Version } from './types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, share } from 'rxjs/operators';
import sortVersions from './sortVersions';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  readonly proxy = 'https://flpaaw.click/';
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
          .map(link => link.href.split('/')[3].split('?')[0])
          .map(deliverable => this.proxy + this.helpBaseUrl + '/http.svc/deliverableMetadata?deliverableInfo=1&toc=1&product_url=' +
              product + '&' + 'deliverable_url=' + deliverable + '&language=en-US&state=PRODUCTION&version=' + version);

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
      }, () => observable.error());
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
            if (product.url) {
              products.push({
                name: product.title,
                code: product.url.split('/')[2].split('?')[0]
              });
            }
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
          const sortedVersions = sortVersions(versions.map(obj => obj.key));
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

}
