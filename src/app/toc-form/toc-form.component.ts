import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TocService } from '../toc.service';
import { FavoritesService } from '../favorites.service';
import { TocNode, Product } from '../types';
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
  favoriteProducts: Product[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private tocService: TocService,
    private favoritesService: FavoritesService,
  ) {
    this.tocForm = this.formBuilder.group({
      product: localStorage.getItem('product') || 'SAP_COMMERCE_CLOUD_PUBLIC_CLOUD',
      version: localStorage.getItem('version') || ''
    });
    this.tocForm.disable();
  }

  ngOnInit() {
    this.products = this.tocService.fetchProducts();
    this.products.subscribe({
      next: resp => {
        this.loadingProducts = false;
        this.onProductChanged(true, true);
      },
      error: () => {
        this.loadingProducts = false;
        console.error('Failed to load products');
      }
    });
    this.loadFavorites();
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
    this.versions.subscribe({
      next: resp => {
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
      },
      error: () => {
        this.loadingProducts = false;
        this.tocForm.enable();
        console.error('Failed to load versions');
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

  onExpandOneLevelPagesClick() {
    const visibleNodes: TocNode[] = [];
    const collectVisible = (node: TocNode) => {
      if (node.visible) {
        visibleNodes.push(node);
      }
      node.children.forEach(child => collectVisible(child));
    };

    this.links.forEach(link => collectVisible(link));
    visibleNodes.forEach(node => node.children.forEach(child => child.visible = true));
  }

  onCollapseAllPagesClick() {
    for (const link of this.links) {
      for (const child of link.children) {
        this.tocService.onCollapseAllClick(child);
      }
    }
  }

  loadFavorites() {
    this.favoriteProducts = this.favoritesService.getFavorites();
  }

  toggleFavorite(product: Product, event: Event) {
    event.stopPropagation();
    this.favoritesService.toggleFavorite(product);
    this.loadFavorites();
  }

  isFavorite(productCode: string): boolean {
    return this.favoritesService.isFavorite(productCode);
  }

  selectFavoriteProduct(product: Product) {
    this.tocForm.patchValue({ product: product.code });
    this.onProductChanged(true, false);
  }

  toggleFavoriteByCode(productCode: string) {
    this.products.subscribe(productList => {
      const product = productList.find(p => p.code === productCode);
      if (product) {
        this.favoritesService.toggleFavorite(product);
        this.loadFavorites();
      }
    });
  }

}
