var win = UT.open("http://www.taobao.com", function () {
    describe("测试uitest", function () {
        it("打开页面淘宝首页", function () {
            var result = -1 != location.href.indexOf("http://www.taobao.com");
            expect(result).toBe(true);
        })
    })
})