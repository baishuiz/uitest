/**
 * Created with JetBrains WebStorm.
 * User: zq
 * Date: 13-8-13
 * Time: 下午1:12
 * To change this template use File | Settings | File Templates.
 */



//require

(function (scope) {
    if (!scope) {
        window.layoutTest = scope = {};
    }

    var toPath = function (el) {


        if (!el)return "";


        var selector = "";
        if (el == document) {
            return "html"
        }

        if (!el.tagName)return "";

        if (el.tagName.toLowerCase() === "body") {
            return "body"
        }
        if (el.tagName.toLowerCase() === "html") {
            return "html"
        }
        if (el.tagName.toLowerCase() === "head") {
            return "head"
        }

        var id = el.getAttribute("id");

        if (id) {


            selector += "#" + id;
            return selector;
        }

        var className = $.trim(el.getAttribute("class"))


        if (className) {
            var avClass = [];
            el._appendClass = el._appendClass || "";
            for (var i = 0; i < el.classList.length; i++) {
                if ($.trim(el.classList[i])) {
                    avClass.push(el.classList[i]);
                }
            }

            if (avClass.length > 0) {
                selector = "." + avClass.join(".");
            }
            else {
                selector = el.tagName.toLowerCase();
            }


        }
        else {
            selector = el.tagName.toLowerCase();
        }


        var old;
        var p = el;

        while (true) {
            p = p.parentNode;

            if (!p || !p.tagName)break;
            var l = $(selector, p).length;

            if (l == 1) {
                old = p;
            } else {
                break;
            }


            if (p.tagName.toLowerCase() === "body") {
                break;
            }
        }


        if (!old) {
            old = el.parentNode || el._parentNode;
            var c = $(old).children(el.tagName.toLowerCase());
            for (var i = 0; i < c.length; i++) {
                if (c[i] == el) {
                    break;
                }
            }

            selector = toPath(old) + ">" + el.tagName.toLowerCase() + ":nth-of-type(" + (i + 1) + ")";

        }

        else {
            if (old.tagName.toLowerCase() == "body") {
                selector = selector
            }
            else {
                selector = toPath(old) + " " + selector;

            }
        }


        return selector;


    }


    var position = function () {
        var result = {}


        var all = $(":visible", document.body);
        all.each(function (index, el) {
            var path = toPath(el);


            var offset = $(el).offset();
            var width = $(el).width();
            var height = $(el).height();

            result[path] = {
                left: offset.left,
                top: offset.top,
                width: width,
                height: height
            }


        })

        return result;


    }


    var contrastBrowers = function (browers, offset) {
        var results = {}
        offset = offset || 0;
        var length = browers.length;
        var base = browers[0];

        for (var i = 1; i < browers.length; i++) {
             var target = browers[i];

            for(var s in base){
                if(target[s]){
                    var baseValue = base[s];
                    var targetValue = target[s];

                    for(var p in baseValue){
                        if

                    }




                }


            }

        }
    }

    scope.position = position;


})(window.layoutTest);