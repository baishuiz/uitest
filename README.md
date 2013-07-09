# UITEST [![Build Status](http://uitest.taobao.net:7070/uitest/uitest/result.png)](http://uitest.taobao.net:7070/uitest/uitest)

uitest一个基于nodejs的前端UI测试框架。让你可以使用JavaScript语言，在真实的浏览览器里进行前端单元、UI和功能测试。

```javascript
UT.open("http://wwww.taobao.com", function(){
 //jasmine语句
  describe("测试淘宝首页", function () {
       it("验证文档标题", function () {
           expect(document.title).toBe("淘宝网 - 淘！我喜欢");
       })
  })
})
```
# uitest可以做什么？

 1.	可以进行前端单元测试，也可支持UI测试和功能测试。
 2.	完全使用前端熟悉的javascript语言，在真实的浏览器里进行测试。
 3.	能够支持多浏览器同时测试。
 4. 整合淘宝前端测试中心服务，可以很方便的进行远程测试。
 5. 和gitlab集成，你的每一次代码提交，都会自动进行测试。（开发中...）

# 安装

uitest是基于nodejs的，你可以使用npm进行安装

```shell
$ npm install -g uitest
```

# 远程测试
使用远程测试，你可以直接连到uitest测试中心，使用测试中心的浏览器进行远程测试。本地机器不需要安装任何浏览器。

```shell
$ uitest run -r -f test.js
```

# 本地测试

在进行本地测试之前，首先要配置需要测试浏览器。通过init命令，uitest会在uitest根目录下生成一个名为uitest.conf.js的配置文件。
如果在配置的过程中遇到实际浏览器路径和默认路径不相符情况，需要进行手动设置，可参考[浏览器配置](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/browser.md)
目前支持的浏览有IE,Chrome,Firefox,Safari.

```shell
# uitest init
```

uitest有进行ui和功能测试的时候需要操作生产环境的真实页面，所以需要浏览器插件的支持。可以通过以下命令进行插件半自动化安装。

```shell
$ uitest plugin
```

配置完成之后就可以进行测试了.

```shell
$ uitest run -f test.js //本地文件，路径是本地路径，可以相对也可以绝对,也可以是远程文件，如http://assets.daily.taobao.net/p/uitest/test/ready.js
$ uitest run -c xxx.html //直接运行html文件。
```

** `--html`方式需要看下[这里](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/html.md) **

# 如何编写测试用例
[uitest-jasmine](http://gitlab.alibaba-inc.com/uitest/uitest/wikis/uitest-jasmine)

# 其它帮助
查看用法可以使用"-h"命令

```shell
$ uitest -h
$ uitest run -h
$ uitest init -h
...
```

# 配置

[浏览器配置](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/bowers.md)
[常见错误QA](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/errors.md)
[HTML类型配置](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/html.md)