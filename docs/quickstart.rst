.. _quickstart:

==========
Quickstart
==========

Once uitest is :doc:`properly installed <installation>`, you can write your first script.

.. hint::

   If you're not too comfortable with Javascript, a :ref:`dedicated FAQ entry <faq_javascript>` is waiting for you.

.. _quickstart_javascript:

A minimal scraping script
-------------------------

Fire up your favorite editor, create and save a ``sample.js`` file like below::

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
            })
        })
    })


Run it:

.. code-block:: text

    $ uitest run -f sample.js

You should get something like this:

.. code-block:: text

    $ uitest run -f sample.js
    INFO [Browser]: Chrome start run
    INFO [Browser]: Chrome is completed
    INFO [Browser]: Chrome navigator to http://guang.taobao.com?_ut_=7547123
    INFO [Browser]: Chrome start run
    INFO [Browser]: Chrome is completed

    -------------------------------------------------------------------------------------------
    测试结果: 浏览器:Chrome 28.0 (Mac) | 用例总数: 2 | 失败用例总数: 0 | 错误数：0
    -------------------------------------------------------------------------------------------

    http://www.taobao.com/?_ut_=7547123
      测试uitest
        打开页面淘宝首页
          expect true toBe true Passed.

    http://guang.taobao.com/?_ut_=7547123
      测试uitest
        跳转到淘宝逛逛页面
          expect true toBe true Passed.


    -------------------------------------------------------------------------------------------

.. topic:: What did we just do?

   1. we started the browser and opened ``http://www.taobao.com/`` and we add ``_ut_=`` to the url,so the script inject by the plugin can recognize it and inject other scripts to page and start ``socket.io`` connect to the uitest progress
   2. once the page has been loaded, we asked to get the ``location.href``,test whether ``location.href`` contains ``http://www.taobao.com``
   3. then we *go* to another url, ``http://guang.taobao.com``
   4. once the new page has been loaded, we asked to get the ``location.href``,test whether ``location.href`` contains ``http://guang.taobao.com``
   5. we executed the whole process