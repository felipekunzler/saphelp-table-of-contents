import { Injectable } from '@angular/core';
import { TocNode } from './toc-node';

@Injectable({
  providedIn: 'root'
})
export class TocService {

  constructor() { }

  async buildTocTree(code: string, version: string): Promise<TocNode[]> {
    const proxy = 'https://cors-anywhere.herokuapp.com/';
    version = '1905'; // E.g. SHIP
    code = 'SAP_COMMERCE'; // E.g. SAP_COMMERCE_CLOUD_PUBLIC_CLOUD
    const product = code;

    const helpUrl = 'https://help.sap.com/http.svc/productpage?locale=en-US&onlyproduct=false&product=';
    const baseUrl = proxy + helpUrl + product + '&state=PRODUCTION&version=' + version;

    const resp = await fetch(baseUrl);
    const json = await resp.json();

    const pages = json.data.deliverables
      .filter(d => d.transtype === 'html5.uacp')
      .sort((a, b) => b.title.localeCompare(a.title))
      .map(d => proxy + 'https://help.sap.com/http.svc/pagecontent?deliverable_id=' + d.id + '&deliverable_loio=' + d.loio);

    const toc: TocNode[] = [];
    for (const page of pages) {
      const pageJson = await fetch(page).then(r => r.json());
      const pageToc = pageJson.data.deliverable.fullToc;
      const item = pageToc[0];
      const loio = pageJson.data.deliverable.loio;

      const tocNode = this.createTocNode(item);
      toc.push(tocNode);

      console.log('item:', item, 'loio: ', loio);
      console.log('tocNode:', tocNode);
    }

    return new Promise<TocNode[]>(resolve => resolve(toc));
  }

  createTocNode(item): TocNode {
    const tocNode: TocNode = {
      name: item.t,
      visible: true,
      children: []
    };
    for (const child of item.c) {
      tocNode.children.push(this.createTocNode(child));
    }
    return tocNode;
  }

}
