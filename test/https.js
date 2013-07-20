var win = UT.open("https://github.com", function () {
    describe("测试uitest", function () {
        it("打开页面成功", function () {
            var result = -1 != location.href.indexOf("https://github.com");
            expect(result).toBe(true);
        })
    })
});