var win = UT.open("http://www.taobao.com", function () {
    describe("测试uitest", function () {
        it("打开页面淘宝首页", function () {
            var result = -1 != location.href.indexOf("http://www.taobao.com");
            expect(result).toBe(true);
        })
    })
})

win.go("http://guang.taobao.com", function () {
    describe("测试uitest", function () {
        it("跳转到淘宝逛逛页面", function () {
            var result = -1 != location.href.indexOf("http://guang.taobao.com");
            expect(result).toBe(true);
            location.href = "http://guang.taobao.com";
        })
    })
})


