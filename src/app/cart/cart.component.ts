import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CartStateService } from '../cart-state.service';
import { ProductCardComponent } from '../product-card/product-card.component';
import { ProductCartService } from '../product-cart.service';
import { Product } from '../product/Product';
import { SharedStateService } from '../shared-state.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  imports: [HttpClientModule, ProductCardComponent, CommonModule]
})
export class CartComponent implements OnDestroy {
  cartList$: Observable<Product[]>;
  isOpen = false;
  private cartOpenSubscription: Subscription;
  private cartListSubscription: Subscription | undefined;
  subtotal: number = 0;

  constructor(
    private cartStateService: CartStateService,
    private cartService: ProductCartService,
    private router: Router,
    private sharedStateService: SharedStateService
  ) {
    this.cartList$ = this.cartService.cartList.asObservable();
    this.cartOpenSubscription = this.cartStateService.isCartOpen$.subscribe(isOpen => {
      this.isOpen = isOpen;
    });
  }

  ngOnInit() {
    this.cartListSubscription = this.cartList$.subscribe(products => {
      this.updateSubtotal(products);
    });
  }

  toggleCart() {
    this.cartStateService.toggleCart();
  }

  ngOnDestroy() {
    this.cartOpenSubscription.unsubscribe();
    if (this.cartListSubscription) {
      this.cartListSubscription.unsubscribe();
    }
  }

  calculateSubtotal(products: Product[]) {
    return products.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }

  updateSubtotal(products: Product[]) {
    this.subtotal = this.calculateSubtotal(products);
  }

  deleteFromCart(product: Product): void {
    this.cartService.removeFromCart(product);
    product.quantity = 0;
  }

  redirectToProductInfo(product: Product): void {
    this.sharedStateService.setProduct(product);
    this.router.navigate(['/product-info']);
    this.toggleCart();
  }

}