.. _html:

.. index:: html

====
Html
====

you can use ``uitest run --html example.html?jstest`` to run your ``jasmine`` html unit tests


Example:
::

    <!doctype html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>uitest jasmine html</title>
        <link rel="stylesheet" type="text/css" href="jasmine/jasmine.css">
        <script type="text/javascript" src="jasmine/jasmine.js"></script>
        <script type="text/javascript" src="jasmine/jasmine-html.js"></script>
    </head>
    <div class="version"></div>
    <body>
        <script type="text/javascript">

        describe('test to be true',function(){
            it('test to be true',function(){
                expect(true).toBe(true)
            })
        });

        (function() {
            var jasmineEnv = jasmine.getEnv();
            jasmineEnv.updateInterval = 250;

            var htmlReporter = new jasmine.HtmlReporter();
            jasmineEnv.addReporter(htmlReporter);

            jasmineEnv.specFilter = function(spec) {
                return htmlReporter.specFilter(spec);
            };
            var currentWindowOnload = window.onload;
            window.onload = function() {
                if (currentWindowOnload) {
                    currentWindowOnload();
                }

                document.querySelector('.version').innerHTML = jasmineEnv.versionString();
                execJasmine();
            };
            function execJasmine() {
                jasmineEnv.execute();
            }
        })();
        </script>
    </body>
    </html>


run it with ``uitest run --html example.html`` (**wrong** method,see warning below) you may see:

.. code-block:: text

    INFO [Browser]: Chrome start run
    INFO [Browser]: Chrome is completed



    -------------------------------------------------------------------------------------------
    测试结果: 浏览器:Chrome 28.0 (Mac) | 用例总数: 0 | 失败用例总数: 0 | 错误数：0
    -------------------------------------------------------------------------------------------

    http://yize.taobao.com/demo/test/testhtml.html?_ut_=70440309


    -------------------------------------------------------------------------------------------


.. warning::

    It`s ``not correct`` if you see the ``above`` result,when you use ``--html`` method, you should know this details:

    1. replace the jasmine native ``jasmine-html.js`` to our `jasmine-html.js <https://github.com/uitest/uitest/blob/master/client/to3party/jasmine-html.js>`_

    2. run command ``uitest run --html example.html?jstest``,pay attention to ``jstest``,it`s **required**

then run it you will see this:

.. code-block:: text

    INFO [Browser]: Chrome start run
    INFO [Browser]: Chrome is completed



    -------------------------------------------------------------------------------------------
    测试结果: 浏览器:Chrome 28.0 (Mac) | 用例总数: 1 | 失败用例总数: 0 | 错误数：0
    -------------------------------------------------------------------------------------------

    http://yize.taobao.com/demo/test/testhtml.html?jstest
      test to be true
        test to be true
          expect true toBe true Passed.


    -------------------------------------------------------------------------------------------
