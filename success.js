// ----- Confetti generator (CSP-friendly: CSS variables, not inline styles) -----
const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6EC7"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function makeConfetti() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";

    confetti.style.setProperty("--left", `${rand(0, 100)}vw`);
    confetti.style.setProperty("--color", colors[Math.floor(Math.random() * colors.length)]);
    confetti.style.setProperty("--dur", `${rand(2, 5)}s`);
    confetti.style.setProperty("--size", `${rand(4, 12)}px`);
    confetti.style.setProperty("--opacity", `${Math.random()}`);

    document.body.appendChild(confetti);
  }
}

makeConfetti();

// ----- Payment confirmation polling -----
const titleEl = document.getElementById("title");
const msgEl = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");

// ✅ Prefer token NOT in URL.
// Your backend returns token on /create-checkout-session.
// Store it in sessionStorage before redirecting to Stripe success page.
// (If token is present in URL for backwards compatibility, we migrate it once.)
const urlToken = params.get("token");
if (urlToken) {
  sessionStorage.setItem("order_token", urlToken);
  // Remove token from URL (prevents leaks via copy/paste, logs, history)
  params.delete("token");
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

const token = sessionStorage.getItem("order_token") || "";

// ✅ API base: use same-origin by default in prod if you proxy /api.
// For your dev LAN, keep fallback. You can set window.__API_BASE__ if you want.
const API_BASE = window.__API_BASE__ || "http://192.168.0.99:5000";

let attempts = 0;
const MAX_ATTEMPTS = 15; // ~30 seconds
const INTERVAL_MS = 2000;

async function pollOrder() {
  attempts++;

  if (!orderId || !token) {
    titleEl.textContent = "Thanks!";
    msgEl.textContent =
      "Your payment was processed. If you don’t receive a confirmation message soon, please contact us.";
    return;
  }

  try {
    const r = await fetch(`${API_BASE}/order/${encodeURIComponent(orderId)}`, {
      headers: {
        // ✅ safer than querystring token
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Failed to fetch order");

    if (data.status === "paid") {
      titleEl.textContent = "Order Confirmed!";
      msgEl.textContent = "Payment confirmed ✅ Thank you for your purchase. We’ll soon be in touch!";
      return;
    }

    if (data.status === "cancelled") {
      titleEl.textContent = "Order Cancelled";
      msgEl.textContent =
        "It looks like the checkout was cancelled or expired. If this is wrong, please contact us.";
      return;
    }

    titleEl.textContent = "Confirming Payment…";
    msgEl.textContent = "Please wait while we confirm your payment (this can take a few seconds).";
  } catch {
    titleEl.textContent = "Confirming Payment…";
    msgEl.textContent = "Please wait while we confirm your payment (this can take a few seconds).";
  }

  if (attempts < MAX_ATTEMPTS) {
    setTimeout(pollOrder, INTERVAL_MS);
  } else {
    titleEl.textContent = "Thanks! (Confirmation Pending)";
    msgEl.textContent =
      "We’re still confirming your payment. If you don’t receive a confirmation message soon, please contact us.";
  }
}

pollOrder();
