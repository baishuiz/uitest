var win = UT.open("http://guang.taobao.com", function () {
    describe("测试uitest", function () {
        it("跳转到淘宝逛逛页面", function () {
            var result = -1 != location.href.indexOf("http://guang.taobao.com");
            expect(result).toBe(true);
            location.href = "http://www.taobao.com"
        })
    })
});
win.ready(function () {
    describe("测试uitest", function () {
        it("页面跳回淘宝页面", function () {
            var result = -1 != location.href.indexOf("http://www.taobao.com");
            expect(result).toBe(true);
        })
    })
});
