// ============================================
// НАСТРОЙКИ TELEGRAM БОТА — впишите свои данные
// ============================================
const TELEGRAM_BOT_TOKEN = "ВАШ_BOT_TOKEN"; // например: 123456789:AAExampleTokenHere
const TELEGRAM_CHAT_ID = "ВАШ_CHAT_ID";     // ID канала, например: -1001234567890

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("arizaForm");
  const statusEl = document.getElementById("formStatus");
  const packageButtons = document.querySelectorAll(".package-btn");
  let selectedPackage = document.querySelector(".package-btn--active")?.dataset.package || "";

  // --- Выбор пакета внутри формы ---
  packageButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      packageButtons.forEach((b) => b.classList.remove("package-btn--active"));
      btn.classList.add("package-btn--active");
      selectedPackage = btn.dataset.package;
    });
  });

  // --- Кнопки "Ariza qoldirish" на карточках паketов и CTA: скролл к форме + выбор пакета ---
  document.querySelectorAll(".js-scroll-to-form").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pkg = btn.dataset.package;
      if (pkg) {
        packageButtons.forEach((b) => {
          b.classList.toggle("package-btn--active", b.dataset.package === pkg);
        });
        selectedPackage = pkg;
      }
      const form = document.getElementById("ariza");
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // --- Простая маска для телефона (Узбекистан, +998) ---
  const phoneInput = document.getElementById("phone");
  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value) phoneInput.value = "+998 ";
  });
  phoneInput.addEventListener("input", () => {
    if (!phoneInput.value.startsWith("+998")) {
      phoneInput.value = "+998";
    }
  });

  // --- Отправка формы ---
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.textContent = "";
    statusEl.className = "form-status";

    const nameInput = document.getElementById("name");
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      showStatus("Iltimos, ismingizni kiriting.", "error");
      nameInput.focus();
      return;
    }
    if (phone.replace(/\D/g, "").length < 12) {
      showStatus("Iltimos, telefon raqamingizni to'liq kiriting.", "error");
      phoneInput.focus();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Yuborilmoqda...";

    const message =
      `🕋 <b>Yangi ariza — Umra Jamiyati</b>\n\n` +
      `👤 <b>Ism:</b> ${escapeHtml(name)}\n` +
      `📞 <b>Telefon:</b> ${escapeHtml(phone)}\n` +
      `📦 <b>Paket:</b> ${escapeHtml(selectedPackage || "tanlanmagan")}\n` +
      `🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}`;

    try {
      const ok = await sendToTelegram(message);
      if (ok) {
        showStatus("Arizangiz qabul qilindi! Tez orada bog'lanamiz.", "success");
        form.reset();
        phoneInput.value = "+998";
        packageButtons.forEach((b) => b.classList.remove("package-btn--active"));
        document.querySelector('.package-btn[data-package="Comfort · $1190"]')
          ?.classList.add("package-btn--active");
        selectedPackage = "Comfort · $1190";
      } else {
        showStatus("Xatolik yuz berdi. Iltimos, telefon orqali bog'laning.", "error");
      }
    } catch (err) {
      console.error(err);
      showStatus("Xatolik yuz berdi. Iltimos, telefon orqali bog'laning.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showStatus(text, type) {
    statusEl.textContent = text;
    statusEl.classList.add(type === "success" ? "is-success" : "is-error");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  async function sendToTelegram(text) {
    if (TELEGRAM_BOT_TOKEN.includes("ВАШ_") || TELEGRAM_CHAT_ID.includes("ВАШ_")) {
      console.warn("Telegram bot token yoki chat ID kiritilmagan. script.js faylini tekshiring.");
      return false;
    }

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    return data.ok === true;
  }
});
