# Requirements Document

## Introduction

This feature adds a "Featured Deals" section to the existing Engine eCommerce landing page. The section fetches live product data from an external API using jQuery AJAX, maps it sequentially into the existing product card layout, and provides a Quick View modal for each product — all without a page reload. The implementation uses HTML5, plain CSS, jQuery (AJAX only), and vanilla JavaScript, preserving the existing responsive design.

## Glossary

- **Featured Deals Section**: A new `<section>` inserted into the landing page that displays dynamically loaded product cards sourced from the FakeStore API.
- **FakeStore API**: The external REST endpoint `https://fakestoreapi.com/products?limit=4` that returns an array of up to 4 product objects.
- **Product Card**: An existing `<article class="product-card">` element in the `.products-grid` container that holds a product image, title, and price.
- **Product Container**: The `.products-grid` `<div>` element that wraps all product cards.
- **Quick View Button**: A `<button>` element rendered inside each product card that triggers the Quick View Modal.
- **Quick View Modal**: A centered popup overlay that displays the full product description and rating for a selected product.
- **Rating**: An object from the API response containing a numeric `rate` (0–5) and an integer `count` (number of reviews).
- **Dark Overlay**: A semi-transparent full-screen backdrop rendered behind the modal to dim the page content.
- **Fallback Message**: A text string displayed inside the Product Container when the API request fails.
- **jQuery AJAX**: The `$.ajax()` or `$.get()` jQuery method used exclusively for the HTTP request to the FakeStore API.

---

## Requirements

### Requirement 1

**User Story:** As a site visitor, I want the Featured Deals section to load live product data automatically, so that I see up-to-date products without refreshing the page.

#### Acceptance Criteria

1. WHEN the page finishes loading, THE Featured Deals Section SHALL send a jQuery AJAX GET request to `https://fakestoreapi.com/products?limit=4` without triggering a full page reload.
2. WHEN the AJAX request succeeds, THE Featured Deals Section SHALL populate exactly 4 product cards sequentially, mapping the first API product to the first card, the second to the second card, and so on.
3. WHEN the AJAX request succeeds, THE Featured Deals Section SHALL inject the product image, product title, and formatted price into each corresponding product card.
4. IF the AJAX request fails or returns a network error, THEN THE Featured Deals Section SHALL display the fallback message "Failed to load products." inside the Product Container.

---

### Requirement 2

**User Story:** As a site visitor, I want the dynamically loaded product cards to match the existing layout, so that the page looks consistent and professional.

#### Acceptance Criteria

1. WHEN product data is injected, THE Product Container SHALL retain the same `.products-grid` flex layout and card structure as the existing static product cards.
2. WHEN product data is injected, THE Featured Deals Section SHALL replace only the inner content (image, title, price) of each existing product card, preserving the card's outer HTML structure and CSS classes.
3. WHILE the page viewport is 768px wide or narrower, THE Product Container SHALL stack product cards in a single column, matching the existing mobile responsive behavior.
4. WHILE the page viewport is wider than 768px, THE Product Container SHALL display product cards in a multi-column flex row, matching the existing desktop responsive behavior.

---

### Requirement 3

**User Story:** As a site visitor, I want a Quick View button on each product card, so that I can preview full product details without leaving the page.

#### Acceptance Criteria

1. WHEN product data is injected into a card, THE Featured Deals Section SHALL render a "Quick View" button inside that card's `.product-info` area.
2. WHEN a visitor clicks a Quick View button, THE Quick View Modal SHALL open and display the full product description and the product rating (rate value and review count).
3. WHEN the Quick View Modal is open, THE Quick View Modal SHALL render centered on the viewport with a Dark Overlay covering the rest of the page.
4. WHEN a visitor clicks the close button (×) inside the Quick View Modal, THE Quick View Modal SHALL close and remove the Dark Overlay.
5. WHEN a visitor clicks anywhere on the Dark Overlay outside the modal panel, THE Quick View Modal SHALL close.

---

### Requirement 4

**User Story:** As a developer, I want the implementation to use only the specified technologies, so that the codebase stays consistent and dependency-free.

#### Acceptance Criteria

1. THE Featured Deals Section SHALL use jQuery exclusively for the AJAX request and SHALL use vanilla JavaScript for all DOM manipulation and modal behavior.
2. THE Featured Deals Section SHALL use plain CSS for all modal and overlay styling, with no external CSS frameworks.
3. THE Featured Deals Section SHALL use HTML5 semantic elements for the section structure and modal markup.
