/* ------------------ tiny UI helpers (CSP-friendly) ------------------ */
function showFlex(el) {
  if (!el) return;
  el.classList.remove("is-hidden");
  el.classList.add("is-flex");
}

function hideEl(el) {
  if (!el) return;
  el.classList.add("is-hidden");
  el.classList.remove("is-flex");
}

function isHidden(el) {
  if (!el) return true;
  return el.classList.contains("is-hidden");
}

/* ------------------ Hamburger menu ------------------ */
const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");

//  default state is hidden
hideEl(menuPanel);

// Toggle menu on hamburger click
menuToggle?.addEventListener("click", function () {
  if (isHidden(menuPanel)) showFlex(menuPanel);
  else hideEl(menuPanel);
});

// Close menu when an item inside is clicked
document.querySelectorAll("#menuPanel button, #menuPanel a").forEach((item) => {
  item.addEventListener("click", () => {
    hideEl(menuPanel);
  });
});

/* ------------------ Popups ------------------ */
document.querySelectorAll("[data-popup]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const popupId = btn.getAttribute("data-popup");
    const popup = document.getElementById(popupId);
    showFlex(popup);
  });
});

// Close popup when clicking the X
document.querySelectorAll(".popup .close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    const popup = closeBtn.closest(".popup");
    hideEl(popup);
  });
});

// Close when clicking outside popup content
window.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("popup")) {
    hideEl(e.target);
  }
});

function openCart() {
  document.getElementById("cart-modal")?.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeCart() {
  document.getElementById("cart-modal")?.classList.remove("open");
  document.body.classList.remove("modal-open");
}

/* ----------------- GRID LOGIC ----------------- */
const grid = document.getElementById("product-grid");
const buttons = document.querySelectorAll("[data-category]");
const article = document.querySelector("article");

// Supabase config
const SUPABASE_URL = "https://gntqahajeerodlronvpp.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdudHFhaGFqZWVyb2Rscm9udnBwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2ODI0MzksImV4cCI6MjA3ODI1ODQzOX0.J46ovIMD--gDmdP0IprQa-Yn9CcwusrQRnenZuYWhEw";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let cart = JSON.parse(localStorage.getItem("cart_v1") || "[]");

function saveCart() {
  localStorage.setItem("cart_v1", JSON.stringify(cart));
  renderCart();
  updateCheckoutState();
}

/* ----------------- ARTICLE CONTENT FOR EACH CATEGORY ----------------- */
const articleContent = {
  cookiePies: {
    img: "https://gntqahajeerodlronvpp.supabase.co/storage/v1/object/public/product-images/traybakes/cake.png",
    title: "Cookie Pies",
    text: `
      Cookie pies are one of our most indulgent treats, deep-dish cookies filled with layers 
      of chocolate, spreads, and delicious toppings. As a new baked goods business in Newcastle, 
      each cookie pie is handmade fresh and packed with flavour, making them perfect for birthdays, 
      celebrations, or simply treating yourself. If you’d like a custom flavour or topping, I’m 
      always happy to take requests, just message me before purchasing so I can make sure your 
      choice is available.
    `,
  },
  cheesecakes: {
    img: "https://gntqahajeerodlronvpp.supabase.co/storage/v1/object/public/product-images/traybakes/cake.png",
    title: "Cheesecakes",
    text: `
      Our cheesecakes are rich, creamy, and full of flavour, from classic favourites to fun new 
      combinations. Each one is crafted with care right here in Newcastle, using high-quality 
      ingredients to create a smooth, luxurious dessert perfect for any occasion. If you have a 
      special idea in mind or want a personalised flavour, I’m more than happy to create something 
      bespoke. Please feel free to contact me before ordering to confirm your custom request.
    `,
  },
  cakes: {
    img: "https://gntqahajeerodlronvpp.supabase.co/storage/v1/object/public/product-images/traybakes/cake.png",
    title: "C.R. Cakes and Bakes",
    extra: `
      <h1>C.R. Cakes and Bakes</h1>
      <p>Welcome to C.R. Cakes & Bakes, a registered small business 
      based in North Shields, bringing a delicious twist to every occasion! 
      We specialise in cookie pies, tray bakes, cheesecakes, and a wide variety of sweet treats crafted with care and creativity.
      <br><br>If you’ve got a custom idea that you haven’t seen on our site, don’t hesitate to reach out, we’d be thrilled to bring your 
      vision to life.</p>
    `,
  },
  sweettreats: {
    img: "https://gntqahajeerodlronvpp.supabase.co/storage/v1/object/public/product-images/traybakes/cake.png",
    title: "Sweet Treats",
    text: `
      Sweet Treats include brownies, blondies, cookies, and all the little delights baked with love 
      and packed with flavour. These are perfect for gifting, sharing, or enjoying alongside a cuppa. 
      As a new Newcastle-based baker, I’m always adding new creations and love experimenting with unique 
      flavours. If you’d like something personalised or have a treat request, please contact me before 
      purchasing so I can make sure I can make it for you.
    `,
  },
  traybakes: {
    img: "https://gntqahajeerodlronvpp.supabase.co/storage/v1/object/public/product-images/traybakes/cake.png",
    title: "Traybakes",
    text: `
      Our traybakes are thick, generous slices of deliciousness, from gooey chocolate bakes to fun, 
      creative flavours. They’re ideal for parties, office treats, or sharing with friends and family. 
      Made fresh here in Newcastle, every traybake is handcrafted with quality ingredients and plenty 
      of care. If you have a custom flavour in mind or want something special for an event, I’m always 
      open to requests. Just send me a message before you order so I can confirm availability.
    `,
  },
};

/* ----------------- BUTTON CLICK + TRANSITION HANDLING ----------------- */
buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;
    updateArticle(category);
    loadProducts(category);
  });
});

/* ----------------- FADE OUT → UPDATE → FADE IN ----------------- */
function updateArticle(category) {
  const data = articleContent[category];
  if (!data) return;

  article.classList.add("fade-out");

  setTimeout(() => {
    article.innerHTML = `
      <div class="imageBox">
        <img src="${data.img}" alt="${data.title}">
      </div>
      <div class="infoBox">
        ${data.extra || `<h1>${data.title}</h1><p>${data.text}</p>`}
      </div>
    `;
    article.classList.remove("fade-out");
  }, 400);
}

/* ----------------- LOAD PRODUCTS ----------------- */
const BUCKET = "product-images";

async function loadProducts(category) {
  grid.innerHTML = "<p>Loading products...</p>";

  try {
    const { data: catData, error: catError } = await supabaseClient
      .from("categories")
      .select("id, name")
      .eq("name", category)
      .single();


    if (catError || !catData) {
      grid.innerHTML = "<p>No products found for this category.</p>";
      return;
    }

    const { data: products, error: prodError } = await supabaseClient
      .from("products")
      .select(`*, product_images ( path, sort_order )`)
      .eq("category_id", catData.id)
      .order("sort_order", { ascending: true });

    if (prodError) {
      console.error(prodError);
      grid.innerHTML = "<p>Error loading products.</p>";
      return;
    }

    grid.innerHTML = "";
    if (!products || products.length === 0) {
      grid.innerHTML = "<p>No products in this category yet.</p>";
      return;
    }

    const toPublicUrl = (path) =>
      supabaseClient.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

    products.forEach((p) => {
      const product = document.createElement("div");
      product.className = "product";

      const imageUrls = (p.product_images || [])
        .map((img) => toPublicUrl(img.path))
        .filter(Boolean);

      const images = imageUrls.length ? imageUrls : p.image_url ? [p.image_url] : [];
      const firstImg = images[0] || "";

      // --- carousel ---
      const carousel = document.createElement("div");
      carousel.className = "product-carousel";
      carousel.dataset.index = "0";
      carousel.dataset.images = JSON.stringify(images);

      const img = document.createElement("img");
      img.className = "product-img";
      img.src = safeImageUrl(firstImg);
      img.alt = p.name || "Product";
      carousel.appendChild(img);

      if (images.length > 1) {
        const prev = document.createElement("button");
        prev.className = "car-arrow car-prev";
        prev.type = "button";
        prev.setAttribute("aria-label", "Previous image");
        prev.textContent = "‹";

        const next = document.createElement("button");
        next.className = "car-arrow car-next";
        next.type = "button";
        next.setAttribute("aria-label", "Next image");
        next.textContent = "›";

        carousel.appendChild(prev);
        carousel.appendChild(next);
      }

      product.appendChild(carousel);

      // --- details ---
      const details = document.createElement("div");
      details.className = "product-details";

      const left = document.createElement("div");

      const nameEl = document.createElement("div");
      nameEl.className = "product-name";
      nameEl.textContent = p.name || "";
      left.appendChild(nameEl);

      const descEl = document.createElement("div");
      descEl.className = "product-desc";
      descEl.textContent = p.description || "";
      left.appendChild(descEl);

      const priceEl = document.createElement("div");
      priceEl.className = "product-price";

      const price = Number(p.price);
      priceEl.textContent = Number.isFinite(price) ? `£${price.toFixed(2)}` : "£—";
      left.appendChild(priceEl);

      details.appendChild(left);

      const right = document.createElement("div");

      // flavours block
      const flavours = document.createElement("div");
      flavours.className = "flavours";

      const lab = document.createElement("label");
      lab.textContent = "Topping:";
      flavours.appendChild(lab);

      const select = document.createElement("select");
      select.className = "dd-flavours";

      const toppingOptions = [
        { v: "No Topping", t: "Plain", imgIndex: "0" },
        { v: "Creme Egg", t: "Creme Egg", imgIndex: "1" },
        { v: "Malteasers", t: "Malteasers", imgIndex: "2" },
        { v: "Oreo", t: "Oreo", imgIndex: "3" },
        { v: "KitKat", t: "KitKat" },
        { v: "Kinder", t: "Kinder" },
        { v: "Crunchie", t: "Crunchie" },
        { v: "Biscoff", t: "Biscoff" },
        { v: "Mint Chocolate", t: "Mint Chocolate" },
        { v: "Chocolate Orange", t: "Chocolate Orange" },
        { v: "White Chocolate and Raspberry", t: "White Chocolate and Raspberry" },
        { v: "Jammy Dodger", t: "Jammy Dodger" },
        { v: "Peanut Butter", t: "Peanut Butter" },
        { v: "Coconut", t: "Coconut" },
        { v: "Salted Caramel", t: "Salted Caramel" },
      ];

      toppingOptions.forEach((o) => {
        const opt = document.createElement("option");
        opt.value = o.v;
        opt.textContent = o.t;
        if (o.imgIndex != null) opt.dataset.imgIndex = o.imgIndex;
        select.appendChild(opt);
      });

      flavours.appendChild(select);

      const ta = document.createElement("textarea");
      ta.className = "ta-flavours";
      ta.placeholder = "Enter your message here...";
      ta.rows = 2;
      flavours.appendChild(ta);

      right.appendChild(flavours);

      // qty block
      const qtyWrap = document.createElement("div");
      qtyWrap.className = "quantity";

      const minus = document.createElement("button");
      minus.className = "qty-minus";
      minus.type = "button";
      minus.textContent = "-";

      const qtySpan = document.createElement("span");
      qtySpan.className = "qty";
      qtySpan.textContent = "1";

      const plus = document.createElement("button");
      plus.className = "qty-plus";
      plus.type = "button";
      plus.textContent = "+";

      qtyWrap.appendChild(minus);
      qtyWrap.appendChild(qtySpan);
      qtyWrap.appendChild(plus);

      right.appendChild(qtyWrap);

      // add button
      const add = document.createElement("button");
      add.className = "add-btn";
      add.type = "button";
      add.textContent = "Add To Bag";
      right.appendChild(add);

      details.appendChild(right);
      product.appendChild(details);

      // --- events ---
      minus.addEventListener("click", () => {
        const q = parseInt(qtySpan.textContent, 10);
        if (q > 1) qtySpan.textContent = String(q - 1);
      });

      plus.addEventListener("click", () => {
        const q = parseInt(qtySpan.textContent, 10);
        qtySpan.textContent = String(q + 1);
      });

      add.addEventListener("click", () => {
        const qty = parseInt(qtySpan.textContent, 10);
        const flavour = select.value;
        const notes = ta.value.trim();

        const imgEl = carousel.querySelector(".product-img");
        const selectedImage = imgEl?.src || "";

        addToCart({
          product_id: p.id,
          name: p.name,
          price: p.price, // display only (server must price)
          quantity: qty,
          flavour,
          notes,
          image: selectedImage,
        });
      });

      grid.appendChild(product);
    });
  } catch (err) {
    console.error("Unexpected error in loadProducts:", err);
    grid.innerHTML = "<p>Something went wrong loading products.</p>";
  }
}

function safeImageUrl(url) {
  try {
    if (!url) return "";
    const u = new URL(url, location.href);
    const allowed = [location.origin, "https://gntqahajeerodlronvpp.supabase.co"];
    return allowed.includes(u.origin) ? u.href : "";
  } catch {
    return "";
  }
}

/* ----------------- Product images arrows --------------------*/
grid.addEventListener("click", (e) => {
  const prev = e.target.closest(".car-prev");
  const next = e.target.closest(".car-next");
  if (!prev && !next) return;

  const carousel = e.target.closest(".product-carousel");
  if (!carousel) return;

  const images = JSON.parse(carousel.dataset.images || "[]");
  if (images.length <= 1) return;

  let idx = parseInt(carousel.dataset.index || "0", 10);
  idx = prev ? (idx - 1 + images.length) % images.length : (idx + 1) % images.length;

  carousel.dataset.index = String(idx);

  const imgEl = carousel.querySelector(".product-img");
  if (imgEl) imgEl.src = safeImageUrl(images[idx]); // ✅ keep allowlist
});

grid.addEventListener("change", (e) => {
  const select = e.target.closest(".dd-flavours");
  if (!select) return;

  const option = select.selectedOptions[0];
  const imgIndex = option?.dataset?.imgIndex;
  if (imgIndex == null) return;

  const product = select.closest(".product");
  const carousel = product?.querySelector(".product-carousel");
  if (!carousel) return;

  const images = JSON.parse(carousel.dataset.images || "[]");
  if (!images[imgIndex]) return;

  carousel.dataset.index = imgIndex;

  const imgEl = carousel.querySelector(".product-img");
  if (imgEl) imgEl.src = safeImageUrl(images[imgIndex]); // ✅ keep allowlist
});

/* ----------------- CART + MODAL + CHECKOUT ----------------- */
function addToCart(item) {
  const existing = cart.find(
    (i) =>
      i.name === item.name &&
      i.flavour === item.flavour &&
      i.notes === item.notes &&
      i.image === item.image
  );

  if (existing) existing.quantity += item.quantity;
  else cart.push({ ...item });

  saveCart();
  flashCartButton();
}

const cartButton = document.getElementById("cart-button");
const cartIcon = document.getElementById("cart-icon"); // ✅ was missing
const cartCountEl = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const cartItemsEl = document.getElementById("cart-items");

const cartSubtotalEl = document.getElementById("cart-subtotal");
const cartDeliveryFeeEl = document.getElementById("cart-delivery-fee");
const cartGrandTotalEl = document.getElementById("cart-grand-total");

const checkoutBtn = document.getElementById("checkout-btn");
const clearCartBtn = document.getElementById("clear-cart");
const closeCartBtn = document.getElementById("close-cart");
const postcodeInput = document.getElementById("cart-delivery-address");

postcodeInput?.addEventListener("input", (e) => {
  const pos = e.target.selectionStart;
  e.target.value = e.target.value.toUpperCase();
  e.target.setSelectionRange(pos, pos);
});

function formatUKPostcode(v) {
  const s = v.replace(/\s+/g, "").toUpperCase();
  if (s.length <= 4) return s;
  return s.slice(0, s.length - 3) + " " + s.slice(-3);
}

postcodeInput?.addEventListener("blur", (e) => {
  e.target.value = formatUKPostcode(e.target.value);
});

let cartDelivery = {
  method: "collection",
  address: "",
};

const SHOP_LAT = 55.01897;
const SHOP_LNG = -1.49205;
const MAX_MILES = 10;

let deliveryAllowed = true;

function debounce(fn, ms = 350) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function milesBetween(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function setDeliveryMessage(msg, ok) {
  const el = document.getElementById("delivery-availability");
  if (!el) return;

  el.textContent = msg;


  el.classList.toggle("delivery-ok", !!ok);
  el.classList.toggle("delivery-bad", !ok);
}

async function checkDeliveryForPostcode(postcodeRaw) {
  const postcode = (postcodeRaw || "").trim();

  if (!postcode) {
    deliveryAllowed = false;
    setDeliveryMessage("Enter a postcode to check delivery.", false);
    return;
  }

  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`
    );
    const data = await res.json();

    if (!res.ok || !data?.result) {
      deliveryAllowed = false;
      setDeliveryMessage("Postcode not found. Please check and try again.", false);
      return;
    }

    const { latitude, longitude } = data.result;
    const miles = milesBetween(SHOP_LAT, SHOP_LNG, latitude, longitude);

    if (miles <= MAX_MILES) {
      deliveryAllowed = true;
      setDeliveryMessage(`Delivery available (${miles.toFixed(1)} miles away).`, true);
    } else {
      deliveryAllowed = false;
      setDeliveryMessage(
        `Delivery not available (${miles.toFixed(1)} miles away). We deliver within ${MAX_MILES} miles.`,
        false
      );
    }
  } catch (err) {
    console.error(err);
    deliveryAllowed = false;
    setDeliveryMessage("Could not check delivery right now. Try again.", false);
  }

  updateCheckoutState();
}

function initDeliveryControls() {
  const methodRadios = document.querySelectorAll('input[name="delivery-method"]');
  const addressBox = document.getElementById("cart-delivery-address-box");
  const postcodeInputLocal = document.getElementById("cart-delivery-address");

  if (!methodRadios.length || !addressBox || !postcodeInputLocal) return;

  function syncDeliveryUI() {
    const checked = document.querySelector('input[name="delivery-method"]:checked');
    cartDelivery.method = checked ? checked.value : "collection";

    
    addressBox.classList.toggle("is-hidden", cartDelivery.method !== "delivery");

    if (cartDelivery.method === "delivery") {
      checkDeliveryForPostcode(postcodeInputLocal.value);
    } else {
      cartDelivery.postcode = "";
      deliveryAllowed = true;
      setDeliveryMessage("", true);
      postcodeInputLocal.value = "";
    }

    renderCart();
    updateCheckoutState();
  }

  methodRadios.forEach((radio) => radio.addEventListener("change", syncDeliveryUI));

  postcodeInputLocal.type = "search";
  postcodeInputLocal.placeholder = "Enter postcode (e.g. NE29 8SX)";
  postcodeInputLocal.addEventListener(
    "input",
    debounce((e) => {
      cartDelivery.postcode = e.target.value.trim();
      checkDeliveryForPostcode(cartDelivery.postcode);
    }, 350)
  );

  syncDeliveryUI();
}

const input = document.getElementById("myDate");

const today = new Date();
today.setDate(today.getDate() + 2);

const minDate = today.toISOString().split("T")[0];
if (input) input.min = minDate;

input?.addEventListener("change", updateCheckoutState);
input?.addEventListener("input", updateCheckoutState);

function getSelectedDeliveryDate() {
  return (document.getElementById("myDate")?.value || "").trim();
}

const termsCheckbox = document.getElementById("termsCheckbox");
termsCheckbox?.addEventListener("change", updateCheckoutState);

function updateCheckoutState() {
  let disabled = false;

  if (!cart.length) disabled = true;

  const selectedDate = getSelectedDeliveryDate();
  if (!selectedDate) disabled = true;

  if (cartDelivery.method === "delivery") {
    if (!cartDelivery.postcode) disabled = true;
    if (!deliveryAllowed) disabled = true;
  }

  if (!termsCheckbox?.checked) disabled = true;

  if (checkoutBtn) checkoutBtn.disabled = disabled;
}

function renderCart() {
  cartItemsEl.textContent = "";
  let subtotal = 0;

  cart.forEach((it, idx) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 0;
    subtotal += price * qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    // Image
    const img = document.createElement("img");
    img.className = "cart-thumb";
    img.alt = it.name || "Item";
    img.src = it.image || "";
    row.appendChild(img);

    // Info column
    const info = document.createElement("div");
    info.className = "cart-info";

    const nameEl = document.createElement("div");
    nameEl.className = "cart-name";
    nameEl.textContent = it.name || "";
    info.appendChild(nameEl);

    const meta = document.createElement("div");
    meta.className = "cart-meta";
    meta.textContent = `Topping: ${it.flavour || "None"}\nNotes: ${it.notes || "None"}`;
    info.appendChild(meta);

    const priceLine = document.createElement("div");
    priceLine.className = "cart-price-line";
    priceLine.textContent = `£${price.toFixed(2)} × ${qty}`;
    info.appendChild(priceLine);

    row.appendChild(info);

    // Controls
    const controls = document.createElement("div");
    controls.className = "cart-controls";

    const btnRow = document.createElement("div");
    btnRow.className = "cart-controls-row";

    const dec = document.createElement("button");
    dec.className = "cart-decrease";
    dec.dataset.idx = String(idx);
    dec.textContent = "-";

    const inc = document.createElement("button");
    inc.className = "cart-increase";
    inc.dataset.idx = String(idx);
    inc.textContent = "+";

    btnRow.appendChild(dec);
    btnRow.appendChild(inc);

    const rm = document.createElement("button");
    rm.className = "cart-remove";
    rm.dataset.idx = String(idx);
    rm.title = "Remove";
    rm.textContent = "✕";

    controls.appendChild(btnRow);
    controls.appendChild(rm);

    row.appendChild(controls);
    cartItemsEl.appendChild(row);
  });

  cartCountEl.textContent = cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  let deliveryFee = 0;
  if (cartDelivery.method === "delivery") {
    deliveryFee = subtotal >= 35 ? 0 : 3;
  }

  cartSubtotalEl.textContent = "Subtotal: £" + subtotal.toFixed(2);
  cartDeliveryFeeEl.textContent = "Delivery Fee: £" + deliveryFee.toFixed(2);
  cartGrandTotalEl.textContent = "Total: £" + (subtotal + deliveryFee).toFixed(2);

  // Bind events
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.idx);
      cart.splice(i, 1);
      saveCart();
    });
  });

  document.querySelectorAll(".cart-decrease").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.idx);
      if (cart[i].quantity > 1) cart[i].quantity--;
      else cart.splice(i, 1);
      saveCart();
    });
  });

  document.querySelectorAll(".cart-increase").forEach((btn) => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.idx);
      cart[i].quantity++;
      saveCart();
    });
  });

  updateCheckoutState();
}

function flashCartButton() {
  cartButton.animate(
    [{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }],
    { duration: 220 }
  );
}

cartButton.addEventListener("click", () => {
  cartModal.classList.toggle("open");
  const isOpen = cartModal.classList.contains("open");
  cartModal.setAttribute("aria-hidden", isOpen ? "false" : "true");
  document.body.classList.toggle("modal-open", isOpen);

  if (cartIcon) cartIcon.textContent = isOpen ? "✕" : "🛒";
  cartButton.title = isOpen ? "Close cart" : "Open cart";
});

closeCartBtn.addEventListener("click", () => {
  cartModal.classList.remove("open");
  cartModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (cartIcon) cartIcon.textContent = "🛒";
  cartButton.title = "Open cart";
});

clearCartBtn.addEventListener("click", () => {
  cart = [];
  saveCart();
  const d = document.getElementById("myDate");
  if (d) d.value = "";
  updateCheckoutState();
});

checkoutBtn.addEventListener("click", async () => {
  if (!cart.length) {
    alert("Your basket is empty");
    return;
  }

  const delivery_date = getSelectedDeliveryDate();

  if (!delivery_date) {
    alert("Please select a delivery/collection date.");
    return;
  }

  if (cartDelivery.method === "delivery" && !cartDelivery.postcode) {
    alert("Please enter a postcode or select collection.");
    return;
  }

  if (cartDelivery.method === "delivery" && !deliveryAllowed) {
    alert("Delivery isn’t available for that address (outside 10 miles). Please choose collection.");
    return;
  }

  checkoutBtn.disabled = true;
  checkoutBtn.textContent = "Redirecting…";

  const API_BASE = "https://crcakes-backend-production.up.railway.app";

  try {
    const res = await fetch(`${API_BASE}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          flavour: i.flavour,
          notes: i.notes,
        })),
        delivery: {
          method: cartDelivery.method,
          postcode: cartDelivery.postcode || "",
        },
        delivery_date,
      }),
    });


    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!res.ok) {
      console.error("Checkout failed:", data || text);
      throw new Error(data?.error || "Checkout failed");
    }

    if (!data?.id) {
      throw new Error("Server did not return a Stripe session id");
    }

    const stripe = Stripe(
      "pk_test_51SRcyYFHzcCcveqyfwRL3zNhOir1wD2caZdv0wSPrV9mUjoGomwVQim8APqxZ9inI0IzOq2lAThawoqkHn4ZreRZ00O9PhEIbe"
    );
    const result = await stripe.redirectToCheckout({ sessionId: data.id });

    if (result.error) {
      alert(result.error.message);
      checkoutBtn.disabled = false;
      checkoutBtn.textContent = "Checkout";
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Could not start checkout. See console for details.");
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = "Checkout";
  }
});

/* ------------------ initial load ------------------ */
window.addEventListener("DOMContentLoaded", () => {
  const defaultBtn = document.querySelector('button[data-category="cakes"]');
  defaultBtn?.click();

  initDeliveryControls();
  renderCart();
  updateCheckoutState();
});




