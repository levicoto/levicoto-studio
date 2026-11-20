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
      ? "Qué estoy armando:\n\nOpción (sesión técnica o acompañamiento):\n\n"
      : "What I'm building:\n\nOption (technical session or guided build):\n\n";
    return "mailto:" + address + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  var mail = document.querySelector("[data-mail]");
  if (mail) {
    mail.addEventListener("click", function () {
      window.location.href = mailtoHref();
    });
  }
})();
