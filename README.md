# UITEST [![Build Status](http://uitest.taobao.net:7070/uitest/uitest/result.png)](http://uitest.taobao.net:7070/uitest/uitest)

uitest一个基于nodejs的前端UI测试框架。让你可以使用JavaScript语言，在真实的浏览览器里进行前端单元、UI和功能测试。

文档：参见[http://uitest.github.io/docs/](http://uitest.github.io/docs/)

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

# 配置

[浏览器配置](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/bowers.md)
[常见错误QA](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/errors.md)
[HTML类型配置](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/docs/html.md)