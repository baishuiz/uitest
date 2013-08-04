var win = UT.open("http://www.taobao.com", function () {
	describe("page uitest", function () {
		it("test taobao.com", function () {
			var result = -1 != location.href.indexOf("http://www.taobao.com");
			expect(result).toBe(true);
		})
	})
})

win.go("http://guang.taobao.com", function () {
	describe("page test", function () {
		it("test guang.taobao.com", function () {
			var result = -1 != location.href.indexOf("http://guang.taobao.com");
			expect(result).toBe(true);
		})
	})
})