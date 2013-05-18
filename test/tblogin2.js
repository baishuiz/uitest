
UT.taobao.login("xiaoju4", "taobao1234", "daily");

UT.open("http://i.daily.taobao.net/my_taobao.htm", function () {
    describe("导航显示登录信息", function () {
        it("显示昵称", function () {
            expect(".user-nick").toHaveHtml("xiaoju4");
        })
    })
})
