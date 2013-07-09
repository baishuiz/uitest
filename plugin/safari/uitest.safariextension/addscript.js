if (parent == self) {
    var script = document.createElement("script");
    script.charset = "utf-8";
    script.src = "http://localhost:8080/static/uitest.js";
    document.body.appendChild(script);
}
