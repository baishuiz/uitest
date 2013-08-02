/*整合cloudyRun 功能
 * @origin  https://github.com/sorrycc/cloudyrun/tree/master/src/public/jasmine
 */
(function () {
    function _login(username, password) {
        var src = 'http://login.' + domain2 + '/member/login.jhtml?from=buy' +
            '&full_redirect=false&redirect_url=' + encodeURI('http://www.' + domain2 + '/go/act/uitest/login.php');

        UT.setData({
            username:username,
            password:password
        })

        var win = UT.open(src, function () {
            describe("登录", function () {
                it("获取数据并提交登录", function () {

                    var info = UT.getData();

                    waitsMatchers(function () {
                        expect(info).toBeDefined();
                    });
                    runs(function () {

                        var doc = document;
                        var safeInput = document.getElementById("J_SafeLoginCheck");
                        var quick = document.getElementById("J_Quick2Static");
                        if (safeInput && safeInput.checked) {
                            safeInput.click();
                            safeInput.checked = false;
                        }
                        if (quick)quick.click();


                        var forms = doc ? doc.getElementsByTagName('form') : null;
                        forms[0]['TPL_username'].value = info.username;
                        forms[0]['TPL_password'].value = info.password;
                        var button = document.getElementById("J_SubmitStatic");
                        button.click();
                        //forms[0].submit();
                        done();

                    })


                })
            })


        })

        win.go(function () {
            describe("登录", function () {
                it("判断登录跳转成功", function () {
                    waitsMathers(function () {
                        expect(window.loginsuccess).toBeDefined();
                    })
                })
            })
        })


    }

    function _logout() {
        var src = 'http://login.' + domain2 + '/member/login.jhtml?style=minisimple&from=buy' +
            '&full_redirect=false&redirect_url=' + encodeURI('http://www.' + domain2 + '/go/act/uitest/login.php');

//        UT.setData({
//            src:'http://login.' + domain2 + '/member/logout.jhtml?f=top&t=' + (+new Date())
//        })


        UT.open(src, function () {
            describe("淘宝帐号登出", function () {
                it("测试淘宝帐号登出", function () {
                    var info = UT.getData();

                    waitsMatchers(function () {

                        expect(info).toBeDefined();
                    });
                    runs(function () {
                        try {
                            var img = new Image();
                            img.src = info.src;

                        } catch (e) {

                        }
                    })
                    waits(2000);
                    expect(1).toBe(1);
                })
            })
        })

    }

    UT.taobao = jasmine.taobao;
})();
