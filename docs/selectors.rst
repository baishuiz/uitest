.. _selectors:

.. index:: selector, DOM, HTML

=========
Selectors
=========

uitest makes an heavy use of selectors in order to work with the `DOM <http://www.w3.org/TR/dom/>`_, and can transparently use either `CSS3 <http://www.w3.org/TR/selectors/>`_

All the examples below are based on this HTML code:

.. code-block:: html

    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>My page</title>
    </head>
    <body>
        <h1 class="page-title">Hello uitest</h1>
        <ul>
            <li>one</li>
            <li>two</li>
            <li>three</li>
        </ul>
        <footer><p>©2012 uitest</p></footer>
    </body>
    </html>

.. index:: CSS, CSS3

CSS3
----

By default, uitest accepts `CSS3 selector strings <http://www.w3.org/TR/selectors/#selectors>`_ to check for elements within the DOM.

To check if the ``<h1 class="page-title">`` element exists in the example page, you can use::

    var win = UT.open('http://domain.cc/page.html',function(){
        describe("h1.page-title", function () {
            it("h1.page-title to exist", function () {
                expect('h1.page-title').toExist();
            })
        })
    })

