// ============================================================
//  MYSHOP STORE — Central Data Layer
//  All data lives in localStorage under these keys:
//    myshop_settings, myshop_products, myshop_orders
// ============================================================

const Store = (() => {

  /* ── Default settings ─────────────────────────────────── */
  const DEFAULT_SETTINGS = {
    storeName:    "MyShop",
    tagline:      "Quality products at your fingertips",
    heroTitle:    "Shop the Latest Trends",
    heroSubtitle: "Free shipping on orders over ₹500",
    heroBtn:      "Shop Now",
    heroBg:       "#1a1a2e",
    accentColor:  "#e94560",
    aboutTitle:   "About Our Store",
    aboutText:    "We are a passionate team dedicated to bringing you the best products. Founded with love and a commitment to quality, every item in our store is hand-picked for you.",
    footerText:   "© 2024 MyShop. All rights reserved.",
    contactEmail: "hello@myshop.com",
    contactPhone: "+91 98765 43210",
    currency:     "₹",
    logo:         "",
    bannerActive: true,
    bannerText:   "🎉 Free shipping on orders above ₹500 — Limited time offer!",
  };

  /* ── Default products ─────────────────────────────────── */
  const DEFAULT_PRODUCTS = [
    {
      id: "p1",
      name: "Classic Cotton T-Shirt",
      price: 799,
      originalPrice: 1299,
      category: "Clothing",
      description: "Premium quality 100% cotton t-shirt. Soft, breathable and perfect for everyday wear. Available in multiple colors.",
      image: "",
      badge: "Best Seller",
      inStock: true,
      featured: true,
    },
    {
      id: "p2",
      name: "Wireless Earbuds Pro",
      price: 2499,
      originalPrice: 3999,
      category: "Electronics",
      description: "True wireless earbuds with active noise cancellation, 24hr battery life and crystal-clear sound.",
      image: "",
      badge: "Sale",
      inStock: true,
      featured: true,
    },
    {
      id: "p3",
      name: "Leather Wallet",
      price: 599,
      originalPrice: 899,
      category: "Accessories",
      description: "Genuine leather bi-fold wallet with RFID blocking, multiple card slots and a slim profile.",
      image: "",
      badge: "New",
      inStock: true,
      featured: false,
    },
  ];

  /* ── Helpers ──────────────────────────────────────────── */
  const get  = (key, def) => { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } };
  const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

  const uid  = () => "id_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

  /* ── Public API ───────────────────────────────────────── */
  return {
    /* Settings */
    getSettings()          { return { ...DEFAULT_SETTINGS, ...get("myshop_settings", {}) }; },
    saveSettings(obj)      { save("myshop_settings", { ...this.getSettings(), ...obj }); },

    /* Products */
    getProducts()          { return get("myshop_products", DEFAULT_PRODUCTS); },
    saveProducts(arr)      { save("myshop_products", arr); },
    getProduct(id)         { return this.getProducts().find(p => p.id === id); },
    addProduct(p)          { const arr = this.getProducts(); p.id = uid(); arr.push(p); this.saveProducts(arr); return p; },
    updateProduct(id, data){ const arr = this.getProducts().map(p => p.id === id ? { ...p, ...data } : p); this.saveProducts(arr); },
    deleteProduct(id)      { this.saveProducts(this.getProducts().filter(p => p.id !== id)); },

    /* Orders */
    getOrders()            { return get("myshop_orders", []); },
    addOrder(o)            { const arr = this.getOrders(); o.id = uid(); o.date = new Date().toISOString(); o.status = "New"; arr.unshift(o); save("myshop_orders", arr); return o; },
    updateOrderStatus(id, status) { save("myshop_orders", this.getOrders().map(o => o.id === id ? { ...o, status } : o)); },

    /* Cart (session) */
    getCart()              { return get("myshop_cart", []); },
    addToCart(id, qty = 1) {
      const cart = this.getCart();
      const idx  = cart.findIndex(i => i.id === id);
      if (idx > -1) cart[idx].qty += qty; else cart.push({ id, qty });
      save("myshop_cart", cart);
    },
    removeFromCart(id)     { save("myshop_cart", this.getCart().filter(i => i.id !== id)); },
    updateCartQty(id, qty) {
      if (qty < 1) return this.removeFromCart(id);
      save("myshop_cart", this.getCart().map(i => i.id === id ? { ...i, qty } : i));
    },
    clearCart()            { save("myshop_cart", []); },
    cartCount()            { return this.getCart().reduce((s, i) => s + i.qty, 0); },
    cartTotal()            {
      const s = this.getSettings();
      return this.getCart().reduce((sum, item) => {
        const p = this.getProduct(item.id);
        return sum + (p ? p.price * item.qty : 0);
      }, 0);
    },
  };
})();
