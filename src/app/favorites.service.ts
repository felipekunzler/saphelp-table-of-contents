import { Injectable } from '@angular/core';
import { Product } from './types';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly FAVORITES_KEY = 'favorite_products';

  constructor() { }

  getFavorites(): Product[] {
    const favorites = localStorage.getItem(this.FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  }

  addFavorite(product: Product): void {
    const favorites = this.getFavorites();
    if (!favorites.find(fav => fav.code === product.code)) {
      favorites.push(product);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  removeFavorite(productCode: string): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.code !== productCode);
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
  }

  isFavorite(productCode: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.code === productCode);
  }

  toggleFavorite(product: Product): void {
    if (this.isFavorite(product.code)) {
      this.removeFavorite(product.code);
    } else {
      this.addFavorite(product);
    }
  }
}
