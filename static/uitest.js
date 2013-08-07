(function (cb, func, id, d) {


	function getScript(url, callback) {
		var script = document.createElement("script");
		script.type = "text/javascript";
		// node.charset = "utf-8";
		script.async = true;

		if (script.attachEvent) {
			script.attachEvent("onreadystatechange", function () {
				if (script.readyState === 'loaded' || script.readyState === 'complete') {
					callback && callback();
				}
			});
		} else {
			script.addEventListener("load", callback, false);
			script.addEventListener("error", callback, false);
		}
		script.src = url;
		document.body.appendChild(script)
	}

	function getScripts(srcs, callback) {
		var i = 0, l = srcs.length;
		var f = function () {
			getScript(srcs[i], function () {
				i++;

				if (i == l) {

					callback && callback();
				}
				else {
					f();
				}
			})
		};
		f();
	}

//	var stamp = location.href.match(/_ut_=(\d*)/) || window.name.match(/_ut_=(\d*)/);

	var etaoStamp = location.href.indexOf('jstest') != -1;

	//使用window.name来保存id信息。window.name页面刷新后不会改变
//	window.name = stamp[0];

	var varname = '_ut_json_report';

	var files = [
		"http://localhost:8080/client/jquery-1.8.3.js",
		"http://localhost:8080/client/jasmine-ui/jasmine.js",
		"http://localhost:8080/client/jasmine-ui/jasmine-html.js",
		"http://localhost:8080/client/jasmine-ui/matcher.js",
		"http://localhost:8080/client/jasmine-ui/simulate.js",
		"http://localhost:8080/client/jasmine-ui/taobao.js"
	];

	if (!etaoStamp) {
		var error;

		getScripts(files, function () {
			try {
				jasmine._newEnv = true;
				if (window.alert)window.alert = function () {
				};
				if (window.confirm)window.confirm = function () {
					return true
				};

				UT.setData(JSON.parse(d));

				with (window.UT) {
					eval(func);
				}
			} catch (e) {
				console.log(e);
				error = {};
				error.message = e.message;
				error.type = e.type;
				error.stack = e.stack;
			}
			finally {
				UT.execute(function (result) {

					if (error) {
						result.errors = result.errors || [];
						result.errors.push(error);
						result.totalErrors = result.errors.length;
						result.url = location.href;
					}

					var data = UT.getData();

					cb && cb({
						result : result,
						data   : data,
						browser: {fullName: window.navigator.userAgent}
					});

				});
			}
		})

	} else {

		var complete = function () {
			if (window[varname]) {
				window[varname].url = location.href;
				clearInterval(timer);
			}
		};
		var timer = setInterval(complete, 1000);

		// show reports();
	}
})(arguments[arguments.length - 1], '{{func}}', '{{id}}', '{{data}}');