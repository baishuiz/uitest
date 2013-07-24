var win = UT.open("https://github.com", function () {
    describe("test location.href", function () {
        it("open github", function () {
            var result = -1 != location.href.indexOf("https://github.com");
            expect(result).toBe(true);
        })
    })
});