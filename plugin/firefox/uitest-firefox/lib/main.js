var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
// contentScriptFile: data.url("my-content-script.js")
pageMod.PageMod({
	include:["*"],	
	contentScriptFile: data.url("script.js")
})