# Design Document  Featured Deals

## Overview

The Featured Deals feature enhances the existing Engine eCommerce landing page by replacing the static "Featured Products" section with a dynamically loaded one. On page load, a jQuery AJAX call fetches 4 products from the FakeStore API and injects them sequentially into the existing product card DOM nodes. Each card gains a "Quick View" button that opens a vanilla-JS modal showing the full product description and rating. All styling is plain CSS; no frameworks are introduced.

---

## Architecture

```
index.html
  - section.featured-products  (existing, re-used)
    - div.products-grid         (existing container, targeted by JS)
      - article.product-card [0..3]  (only first 4 cards updated)
  - #qv-overlay                 (new modal markup appended to body)

style.css          - modal + quick-view-btn styles appended
featured-deals.js  - new file: AJAX + DOM + modal logic
```

Data flow:

```
Page load
  -> featured-deals.js DOMContentLoaded
    -> $.ajax GET https://fakestoreapi.com/products?limit=4
      - success -> injectProducts(data)
            -> for each card[i]: updateCard(card, product)
                  -> attach quickViewBtn -> openModal(product)
      - error   -> showFallback()
```

---

## Components and Interfaces

### 1. featured-deals.js

Single self-contained IIFE. Internal functions:

| Function        | Signature                          | Responsibility                                    |
|-----------------|------------------------------------|---------------------------------------------------|
| injectProducts  | (products: Product[]) -> void      | Iterates cards, calls updateCard for each         |
| updateCard      | (card: Element, product) -> void   | Replaces image/title/price, appends Quick View btn|
| showFallback    | () -> void                         | Clears grid, inserts error message                |
| openModal       | (product: Product) -> void         | Populates and shows the modal                     |
| closeModal      | () -> void                         | Hides the modal                                   |

### 2. Modal HTML (injected once at runtime into body)

```html
<div id="qv-overlay" aria-hidden="true">
  <div id="qv-modal" role="dialog" aria-modal="true" aria-labelledby="qv-title">
    <button id="qv-close" aria-label="Close quick view">x</button>
    <img id="qv-img" src="" alt="" />
    <h3 id="qv-title"></h3>
    <p id="qv-desc"></p>
    <p id="qv-rating"></p>
  </div>
</div>
```

### 3. CSS additions (appended to style.css)

- .btn-quick-view  - outline style matching the site design tokens
- #qv-overlay      - fixed full-screen dark backdrop, hidden by default (display:none)
- #qv-modal        - centered white panel, max-width 520px, scrollable on small screens
- #qv-close        - absolute top-right close button

---

## Data Models

FakeStore API product object (relevant fields):

```js
{
  id:          number,
  title:       string,
  price:       number,       // USD float
  image:       string,       // absolute URL
  description: string,
  rating: {
    rate:  number,           // 0-5
    count: number            // integer
  }
}
```

Fields used:
- title, price, image       -> card injection
- description, rating.rate, rating.count -> modal display

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

---

### Property 1: Sequential card injection

For any array of 4 product objects passed to injectProducts, the card at position i in .products-grid SHALL contain an img whose src equals products[i].image, an h3 whose text equals products[i].title, and a price element whose text includes products[i].price.

**Validates: Requirements 1.2, 1.3**

---

### Property 2: Card outer structure preserved after injection

For any product injected into a card, the card element SHALL still carry the class product-card, SHALL still contain a .product-image child and a .product-info child, and the .products-grid container SHALL still exist in the DOM.

**Validates: Requirements 2.1, 2.2**

---

### Property 3: Quick View button present after injection

For any product injected into a card, the card's .product-info area SHALL contain a button element with accessible text matching "Quick View".

**Validates: Requirements 3.1**

---

### Property 4: Modal opens with correct content and overlay

For any product whose Quick View button is clicked, the #qv-overlay element SHALL become visible, the #qv-modal element SHALL be visible, and the modal SHALL contain the product's description text and a string representation of rating.rate and rating.count.

**Validates: Requirements 3.2, 3.3**

---

### Property 5: Modal closes on close-button click

For any open modal state, clicking the #qv-close button SHALL result in #qv-overlay becoming hidden.

**Validates: Requirements 3.4**

---

### Property 6: Modal closes on overlay click

For any open modal state, a click event dispatched on #qv-overlay (not on #qv-modal) SHALL result in #qv-overlay becoming hidden.

**Validates: Requirements 3.5**

---

### Property 7: Responsive layout direction

For any viewport width, the computed flex-direction of .products-grid SHALL be column when the viewport is 768px or narrower, and SHALL be row (or its default) when the viewport is wider than 768px.

**Validates: Requirements 2.3, 2.4**

---

### Example: Fallback message on API failure

When showFallback() is called, the .products-grid container SHALL contain the text "Failed to load products."

**Validates: Requirements 1.4**

---

## Error Handling

- The $.ajax error callback calls showFallback(), which clears .products-grid and inserts a paragraph with class deals-error and text "Failed to load products."
- If the API returns fewer than 4 products, only the available cards are updated; remaining cards retain their static content.
- Images that fail to load display the alt text gracefully via an onerror handler.

---

## Testing Strategy

### Property-Based Testing

Library: fast-check (JavaScript) - npm install --save-dev fast-check

Each correctness property maps to one property-based test using fc.assert(fc.property(...)). Tests run a minimum of 100 iterations each.

Each test is tagged with the comment:
// **Feature: featured-deals, Property N: property text**

| Property | Test description                    | Generator                                                        |
|----------|-------------------------------------|------------------------------------------------------------------|
| 1        | Sequential card injection           | fc.array(fc.record({title,price,image}), {minLength:4,maxLength:4}) |
| 2        | Card outer structure preserved      | Same product array generator                                     |
| 3        | Quick View button present           | Same product array generator                                     |
| 4        | Modal opens with correct content    | fc.record({title,price,image,description,rating:{rate,count}})   |
| 5        | Modal closes on close-button click  | Arbitrary open-modal state                                       |
| 6        | Modal closes on overlay click       | Arbitrary open-modal state                                       |
| 7        | Responsive layout direction         | fc.integer({min:200, max:1600}) for viewport width               |

### Unit Tests

- Fallback message example (simulated AJAX error)
- HTML5 semantic structure of modal markup (role, aria attributes)
- Price formatting: $9.99 format from float 9.99

### Test File Location

featured-deals.test.js co-located in the project root alongside featured-deals.js.
