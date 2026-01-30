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

// ----- Status icon (spinner -> emoji) -----
const statusIcon = document.querySelector(".status-icon");
const emojiEl = document.querySelector(".status-icon .emoji");

function setStatus(state) {
  // state: "loading" | "paid" | "cancelled"
  statusIcon?.classList.remove("is-paid", "is-cancelled");

  if (state === "paid") {
    statusIcon?.classList.add("is-paid");
    if (emojiEl) {
      emojiEl.textContent = "🙂";
      emojiEl.setAttribute("aria-label", "Order confirmed");
    }
    return;
  }

  if (state === "cancelled") {
    statusIcon?.classList.add("is-cancelled");
    if (emojiEl) {
      emojiEl.textContent = "😕";
      emojiEl.setAttribute("aria-label", "Order cancelled");
    }
    return;
  }

  // loading
  if (emojiEl) emojiEl.textContent = "";
}

// ----- Payment confirmation polling -----
const titleEl = document.getElementById("title");
const msgEl = document.getElementById("message");

const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");

// ✅ Prefer token NOT in URL.
// Backend returns token on /create-checkout-session.
// If token is present in URL for backwards compatibility, migrate it into sessionStorage.
const urlToken = params.get("token");
if (urlToken && orderId) {
  sessionStorage.setItem(`order_token_${orderId}`, urlToken);

  // Remove token from URL (prevents leaks via copy/paste, logs, history)
  params.delete("token");
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.replaceState({}, "", newUrl);
}

// Read token (stored before redirect to Stripe, keyed by orderId)
const token = orderId ? sessionStorage.getItem(`order_token_${orderId}`) || "" : "";

// ✅ Same-origin API calls via Vercel rewrite: /api/* -> Railway backend
const API_BASE = ""; // keep empty; use /api paths below

let attempts = 0;
const MAX_ATTEMPTS = 15; // ~30 seconds
const INTERVAL_MS = 2000;

async function pollOrder() {
  attempts++;

  // default state while polling
  setStatus("loading");

  if (!orderId || !token) {
    titleEl.textContent = "Thanks!";
    msgEl.textContent =
      "Your payment was processed. If you don’t receive a confirmation message soon, please contact us.";
    return;
  }

  try {
    const r = await fetch(`${API_BASE}/api/order/${encodeURIComponent(orderId)}`, {
      headers: {
        // Backend must accept Authorization: Bearer <token>
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || "Failed to fetch order");

    if (data.status === "paid") {
      setStatus("paid");
      titleEl.textContent = "Order Confirmed!";
      msgEl.textContent =
        "Payment confirmed ✅ Thank you for your purchase. We’ll soon be in touch!";
      return;
    }

    if (data.status === "cancelled") {
      setStatus("cancelled");
      titleEl.textContent = "Order Cancelled";
      msgEl.textContent =
        "It looks like the checkout was cancelled or expired. If this is wrong, please contact us.";
      return;
    }

    // pending / other status
    titleEl.textContent = "Confirming Payment…";
    msgEl.textContent = "Please wait while we confirm your payment (this can take a few seconds).";
  } catch (e) {
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







