const CART_KEY = "richChickenCart";

function loadCart() {
  const saved = localStorage.getItem(CART_KEY);
  return saved ? JSON.parse(saved) : { items: [] };
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getCartTotal(cart) {
  return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function getCartCount(cart) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function formatKES(value) {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(value);
}

function addToCart(name, price, quantity) {
  if (quantity < 1) quantity = 1;
  const cart = loadCart();
  const existing = cart.items.find((item) => item.name === name);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ name, price, quantity });
  }
  saveCart(cart);
}

function updateMenuCartDisplay() {
  const cart = loadCart();
  const countLabel = document.getElementById("cartCount");
  const totalLabel = document.getElementById("cartTotal");
  const gotoButton = document.getElementById("gotoCheckout");
  if (countLabel) {
    countLabel.textContent = getCartCount(cart);
  }
  if (totalLabel) {
    totalLabel.textContent = formatKES(getCartTotal(cart));
  }
  if (gotoButton) {
    const count = getCartCount(cart);
    gotoButton.disabled = cart.items.length === 0;
    gotoButton.textContent = cart.items.length
      ? `Checkout with ${count} item${count === 1 ? "" : "s"}`
      : "Add items to cart to checkout";
  }
}

function renderCheckoutCart() {
  const cart = loadCart();
  const container = document.getElementById("cartContainer");
  const totalLabel = document.getElementById("checkoutTotal");
  const hiddenCart = document.getElementById("cart_data");
  const checkoutSubmit = document.getElementById("checkoutSubmit");
  if (!container || !totalLabel || !hiddenCart) return;

  container.innerHTML = "";
  if (!cart.items.length) {
    container.innerHTML =
      "<p class='empty-cart'>Your cart is empty. Return to the menu to add items.</p>";
    totalLabel.textContent = formatKES(0);
    if (checkoutSubmit) checkoutSubmit.disabled = true;
    hiddenCart.value = "";
    return;
  }

  const list = document.createElement("div");
  list.className = "cart-list";
  cart.items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-row";
    row.innerHTML = `
      <span>${item.quantity} × ${item.name}</span>
      <span>${formatKES(item.price * item.quantity)}</span>`;
    list.appendChild(row);
  });

  const totalRow = document.createElement("div");
  totalRow.className = "cart-row total-row";
  totalRow.innerHTML = `
    <strong>Total</strong>
    <strong>${formatKES(getCartTotal(cart))}</strong>`;
  list.appendChild(totalRow);

  container.appendChild(list);
  totalLabel.textContent = formatKES(getCartTotal(cart));
  hiddenCart.value = JSON.stringify(cart.items);
  if (checkoutSubmit) checkoutSubmit.disabled = true;
}

function redirectToMpesa(amount) {
  const phoneInput = document.getElementById("phone");
  const phone = phoneInput?.value.trim();
  if (!phone) {
    alert("Please enter your mobile number before paying with M-PESA.");
    return;
  }

  const mpesaDeep = `mpesa://pay?phone=${encodeURIComponent(phone)}&amount=${encodeURIComponent(amount)}&account=RichChickenHub`;
  const fallback = `https://safaricom.co.ke/mpesa?phone=${encodeURIComponent(phone)}&amount=${encodeURIComponent(amount)}`;

  window.location.href = mpesaDeep;
  setTimeout(() => {
    window.location.href = fallback;
  }, 1200);
}

function redirectToBitcoin() {
  const lightningAddress = "hopekuku@blink.sv";
  window.location.href = `lightning:${lightningAddress}`;
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  const paymentMethod = document.getElementById("payment_method").value;
  const cart = loadCart();
  const amount = getCartTotal(cart);

  if (!paymentMethod) {
    alert("Please choose a payment method before completing your order.");
    return;
  }

  if (!cart.items.length) {
    alert(
      "Your cart is empty. Please add items from the menu before checkout.",
    );
    return;
  }

  if (paymentMethod === "M-PESA") {
    redirectToMpesa(amount);
    return;
  }

  if (paymentMethod === "Bitcoin") {
    redirectToBitcoin();
    return;
  }
}

function initializeCartUI() {
  const addButtons = document.querySelectorAll(".add-cart");
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price) || 0;
      const quantityInput = button
        .closest(".item-details")
        .querySelector(".item-quantity");
      const quantity = Number(quantityInput?.value) || 1;
      addToCart(name, price, quantity);
      updateMenuCartDisplay();
      if (quantityInput) quantityInput.value = 1;
      button.textContent = "Added";
      setTimeout(() => {
        button.textContent = "Add to cart";
      }, 800);
    });
  });

  const gotoButton = document.getElementById("gotoCheckout");
  if (gotoButton) {
    gotoButton.addEventListener("click", () => {
      const cart = loadCart();
      if (cart.items.length) {
        window.location.href = "checkout.html";
      }
    });
  }

  const checkoutForm = document.querySelector(".checkout-form");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", handleCheckoutSubmit);
  }

  updateMenuCartDisplay();
  renderCheckoutCart();
}

window.addEventListener("DOMContentLoaded", initializeCartUI);

// Helper for user interaction when choosing M-Pesa.
function showMpesa() {
  alert(
    "Tap the M-Pesa button, then enter your phone number to complete the payment.",
  );
}

// Optional helper for Bitcoin wallet flow.
function showBitcoin() {
  const lightningAddress = "hopekuku@blink.sv";
  window.location.href = `lightning:${lightningAddress}`;
}

// Fun Scroll Effect, only if a nav exists on the page.
window.addEventListener("scroll", () => {
  const nav = document.querySelector("nav");
  if (!nav) return;

  if (window.scrollY > 50) {
    nav.style.background = "rgba(255, 102, 0, 0.9)";
    nav.style.transition = "0.5s";
  } else {
    nav.style.background = "transparent";
  }
});

// Only attach the map hover listener if an area exists.
const mapArea = document.querySelector("area");
if (mapArea) {
  mapArea.addEventListener("mouseover", function () {
    console.log("Customer is hungry for chicken!");
  });
}
