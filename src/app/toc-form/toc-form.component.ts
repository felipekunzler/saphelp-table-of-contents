import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TocService } from '../toc.service';
import { TocNode } from '../types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toc-form',
  templateUrl: './toc-form.component.html',
  styleUrls: ['./toc-form.component.scss']
})
export class TocFormComponent implements OnInit {

  tocForm;
  links: TocNode[] = [];
  loading = false;
  loadingProducts = true;
  pagesLoaded = 0;

  versions: Observable<any>;
  products: Observable<any>;

  constructor(
    private formBuilder: FormBuilder,
    private tocService: TocService,
  ) {
    this.tocForm = this.formBuilder.group({
      product: localStorage.getItem('product') || 'SAP_COMMERCE_CLOUD_PUBLIC_CLOUD',
      version: localStorage.getItem('version') || ''
    });
    this.tocForm.disable();
  }

  ngOnInit() {
    this.products = this.tocService.fetchProducts();
    this.products.subscribe(resp => {
      this.onProductChanged(true, true);
    });
  }

  onSubmit(tocFormData) {
    this.loading = true;
    this.pagesLoaded = 0;
    this.links = [];
    const observable = this.tocService.buildTocTree(tocFormData.product, tocFormData.version);
    localStorage.setItem('product', tocFormData.product);
    localStorage.setItem('version', tocFormData.version);
    observable.subscribe({
      next: toc => {
        this.links.push(toc);
        this.pagesLoaded += this.getNumberOfPages(toc) + 1;
        this.links.sort((a, b) => a.name.localeCompare(b.name));
      },
      complete: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  onProductChanged(loadContent: boolean, firstLoad: boolean) {
    this.versions = this.tocService.fetchVersions(this.tocForm.value.product);
    this.versions.subscribe(resp => {
      this.loadingProducts = false;
      this.tocForm.enable();
      if (resp[0]) {
        if (firstLoad) {
          this.tocForm.get('version').patchValue(this.tocForm.value.version || resp[0].key);
        } else {
          this.tocForm.get('version').patchValue(resp[0].key);
        }
        if (loadContent) {
          this.onSubmit(this.tocForm.value);
        }
      }
    });
  }

  getNumberOfPages(item: TocNode) {
    let count = item.children.length;
    for (const child of item.children) {
      count += this.getNumberOfPages(child);
    }
    return count;
  }

  onExpandAllPagesClick() {
    this.links.forEach(link => this.tocService.onExpandAllClick(link));
  }

  onCollapseAllPagesClick() {
    for (const link of this.links) {
      for (const child of link.children) {
        this.tocService.onCollapseAllClick(child);
      }
    }
  }

}
