var win = UT.open("http://localhost:8080/static/blank.html", function () {
    describe("测试uitest", function () {
        it("打开页面成功", function () {
            var result = -1 != location.href.indexOf("http://localhost:8080/static/blank.html");
            expect(result).toBe(true);
        })
    })
})