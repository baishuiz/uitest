UT.setData({
	a: 1,
	b: 2
});
var win = UT.open("http://localhost:8080/static/blank.html", function () {
	describe("open", function () {
		it("hello", function () {
			var result = -1 != location.href.indexOf("http://localhost:8080/static/blank.html");
			expect(result).toBe(true);
		});
	})
});