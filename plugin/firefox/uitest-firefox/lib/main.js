var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
// contentScriptFile: data.url("my-content-script.js")
pageMod.PageMod({
	include:["*"],	
	contentScriptFile: data.url("script.js", "https://github.com", function () {
        self.timeout(sessionId, function () {

            var script = "document.body.style.backgroundColor='red';"
            self.executeAsync(sessionId, script, function (result) {
                console.log("result", result)
//                        self.close(sessionId);
            })
        })
        // close(sessionId)

    })
})