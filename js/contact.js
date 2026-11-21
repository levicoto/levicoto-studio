// Placeholder. Replace SIGNAL_URL with the real Signal link.
var SIGNAL_URL = "[signal]";

(function () {
  var signal = document.querySelector("[data-signal]");
  if (signal) {
    signal.setAttribute("href", SIGNAL_URL);
  }

  function lang() {
    return document.documentElement.getAttribute("data-lang") === "es" ? "es" : "en";
  }

  function mailtoHref() {
    var current = lang();
    var local = ["levico", "studio"].join("+");
    var host = ["mail", "grokbot", "com"].join(".");
    var address = local + String.fromCharCode(64) + host;
    var subject = "Coto Studio";
    var body = current === "es"
      ? "Qué estoy armando:\n\nOpción (sesión técnica, acompañamiento o desarrollo llave en mano):\n\n"
      : "What I'm building:\n\nOption (technical session, guided build, or turnkey development):\n\n";
    return "mailto:" + address + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  var mail = document.querySelector("[data-mail]");
  if (mail) {
    mail.addEventListener("click", function () {
      window.location.href = mailtoHref();
    });
  }

  var form = document.querySelector(".inquiry");
  if (!form) return;

  var language = form.querySelector("input[name='language']");
  var submit = form.querySelector("[type='submit']");
  var success = form.querySelector("[data-success]");
  var failure = form.querySelector("[data-error]");
  var again = form.querySelector("[data-again]");
  var fallbacks = form.querySelectorAll("a.fallback");
  var keys = ["name", "contact", "situation", "service"];
  var messages = {
    name: { en: "Add your name.", es: "Agregá tu nombre." },
    contact: { en: "Tell me how to reach you.", es: "Decime cómo contactarte." },
    situation: { en: "Tell me about the project.", es: "Contame el proyecto." },
    service: { en: "Choose a service.", es: "Elegí un servicio." }
  };
  var touched = {};
  var submitted = false;

  function filled(key) {
    if (key === "service") return !!form.querySelector("input[name='service']:checked");
    var field = form.querySelector("[name='" + key + "']");
    return !!(field && field.value.trim());
  }

  function renderError(key) {
    var show = (touched[key] || submitted) && !filled(key);
    var box = form.querySelector('[data-field="' + key + '"]');
    var note = form.querySelector('[data-error-for="' + key + '"]');
    if (box) box.classList.toggle("is-invalid", !!show);
    if (note) {
      note.hidden = !show;
      note.textContent = show ? messages[key][lang()] : "";
    }
    var control = key === "service" ? box : form.querySelector("[name='" + key + "']");
    if (control) control.setAttribute("aria-invalid", show ? "true" : "false");
  }

  function renderErrors() {
    for (var i = 0; i < keys.length; i++) renderError(keys[i]);
  }

  function clearErrors() {
    touched = {};
    submitted = false;
    for (var i = 0; i < keys.length; i++) renderError(keys[i]);
  }

  function syncLanguage() {
    var current = lang();
    if (language) language.value = current;
    var href = mailtoHref();
    for (var i = 0; i < fallbacks.length; i++) fallbacks[i].setAttribute("href", href);
    renderErrors();
  }

  syncLanguage();

  var switcher = document.querySelector(".lang-switch");
  if (switcher) {
    switcher.addEventListener("click", function () {
      syncLanguage();
    });
  }

  form.addEventListener("blur", function (event) {
    var box = event.target.closest ? event.target.closest("[data-field]") : null;
    if (!box) return;
    var key = box.getAttribute("data-field");
    touched[key] = true;
    renderError(key);
  }, true);

  form.addEventListener("input", function (event) {
    var box = event.target.closest ? event.target.closest("[data-field]") : null;
    if (!box) return;
    var key = box.getAttribute("data-field");
    if (touched[key] || submitted) renderError(key);
  });

  form.addEventListener("change", function (event) {
    if (!event.target || event.target.name !== "service") return;
    touched.service = true;
    renderError("service");
  });

  function show(el) {
    if (!el) return;
    el.hidden = false;
    el.focus();
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function setSending(sending) {
    if (!submit) return;
    submit.disabled = sending;
    if (sending) submit.setAttribute("aria-busy", "true");
    else submit.removeAttribute("aria-busy");
  }

  function validate() {
    submitted = true;
    var first = null;
    for (var i = 0; i < keys.length; i++) {
      renderError(keys[i]);
      if (!filled(keys[i]) && !first) first = keys[i];
    }
    if (!first) return true;
    var target = first === "service"
      ? form.querySelector("input[name='service']")
      : form.querySelector("[name='" + first + "']");
    if (target) target.focus();
    return false;
  }

  if (again) {
    again.addEventListener("click", function () {
      form.classList.remove("is-sent");
      hide(success);
      form.reset();
      syncLanguage();
      clearErrors();
      var name = form.querySelector("#inquiry-name");
      if (name) name.focus();
    });
  }

  if (!window.fetch || !window.FormData) return;
  form.noValidate = true;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    syncLanguage();
    hide(failure);
    if (!validate()) return;

    setSending(true);
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? window.setTimeout(function () { controller.abort(); }, 20000) : 0;
    var options = {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    };
    if (controller) options.signal = controller.signal;

    fetch(form.action, options).then(function (response) {
      if (!response.ok) throw new Error("Request failed");
      form.reset();
      syncLanguage();
      clearErrors();
      form.classList.add("is-sent");
      show(success);
    }).catch(function () {
      show(failure);
    }).then(function () {
      if (timer) window.clearTimeout(timer);
      setSending(false);
    });
  });
})();
