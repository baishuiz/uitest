.. _uitest_module:

=====================
The ``uitest`` module
=====================

.. index:: uitest api

The ``Uitest`` class
++++++++++++++++++++

uitest has it`s own APIs to let you get control to browsers

.. _uitest_api:

.. index:: ut , list

``UT``
++++++++++++++++++

The whole list of available uitest api is detailed below.

.. index:: open url

.. _uitest_UT_API:

``open(url,func)``
------------------

**url**: ``String`` the url you wanna open

**func**: ``Function`` you can write all your test scripts inside this callback function

A function that can let you open browser or new windows

example: ::

    UT.open("test.html", function(){
     //jasmine语句
      describe("打开页面test.html", function () {
           it("执行测试", function () {

           })
      })
    })


.. index:: go url

``go([url],func)``
------------------

**url**: ``String`` ``optional`` the url you wanna go same as `open <open(url,func)>`_

**func**: ``Function`` you can write all your test scripts inside this callback function

A function that let you go to a page , just as ``location.href``,or just add another callback

example: ::

    var win = UT.open("test.html", function(){
     //jasmine语句
      describe("打开页面test.html", function () {
           it("执行测试", function () {

           })
      })
    })
    win.go("test2.html", function () {
       //jasmine语句
      describe("跳转到页面test.html", function () {
           it("执行测试", function () {
           })
      })

    })


.. index:: ready,onload

``ready(func)``
---------------

**func** ``Function`` you can write all your test scripts inside this callback function

execute the function when the page is ready

example : ::

    var win = UT.open("test.html", function(){
     //jasmine语句
      describe("打开页面test.html", function () {
           it("执行测试", function () {
              // 跳转
           })
      })
    })
    //等待页面加载完成
    win.ready("test2.html", function () {
       //jasmine语句
      describe("跳转到页面test.html", function () {
           it("执行测试", function () {
           })
      })
    })

.. index:: set,data

``setData(data)``
-----------------



set data by using setData to let the data cross pages

example: ::

    UT.setData({
      username:"username",
      password:"password"
    })

**data** : the data to set , so you can get the data on pages

.. index:: get,data

``getData(function(data){})``
-----------------------------


example: ::

    UT.setData({
      username:"xiaoju4",
      password:"taobao1234"
    })

    UT.open("test.html", function () {
      describe("打开页面", function () {
           it("执行测试", function () {
              getData(function(data){console.log(data)})
           })
      })
    })


.. index:: config,timeout,autoclose

``config()``
------------

``config(options)``

``options.autoClose``

**type** : Boolean

**default** : true

when you set this to false , the opened window will not be closed, so you can do debug yourself on the page

example: ::

    UT.config({autoClose:false})


``options.timeout``

**type** : Boolean

**default** : 60000  (sec)

the process of UT will exit if timeout

example: ::

    UT.config({timeout:60000})

.. index:: taobao,login

``taobao``
----------

``login(username,password,isDaily)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**username** ``String`` your username

**password** ``String`` your password,do not need to encode

**isDaily** ``Boolean`` if you set it to true , it mean you are in taobao develop env

you can use this to sign in ``taobao.com``

.. warning::

    you should use this before you use `open <open(url,func)>`_

example: ::

    //登录功能，写UT.open之前。
    UT.taobao.login("xiaoju4","taobao1234",true);
    UT.open("test2.html", function () {
       //jasmine语句
      describe("跳转到页面test.html", function () {
           it("执行测试", function () {
           })
      })
    })


.. index:: taobao,logout,unlogin

``logout(isDaily)``
~~~~~~~~~~~~~~~~~~~

**isDaily** ``Boolean`` if you set it to true , it mean you are in taobao develop env

you can use this to log out ``taobao.com``

.. warning::

    you should use this before you use `open <open(url,func)>`_

example: ::

    UT.taobao.logout(true)
