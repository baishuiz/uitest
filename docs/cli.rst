.. _cli:

.. index:: Command line, CLI, PhantomJS, Shell, arguments, options

======================
Using the command line
======================

uitest ships with a built-in command line parser , located in the ``bin/uitest``; it exposes passed arguments as **positional ones** and **named options**

if you have **not** install uitest , please read :doc:`installation <installation>`

`uitest` native options
-------------------------

The `uitest` command has four available command:

.. _cli-init:

.. index:: init

init
----

- ``-c, --colors``:Use colors when reporting and printing logs.
- ``-l, --log-level [level]``:<disable | error | warn | info | debug> Level of logging.

Example:

.. code-block:: text

    $ uitest init -c
    $ uitest init -l debug

.. index:: run
run
----

- ``-f, --file [file]``: the test local or remote file you wanner run
- ``-c, --html [file]``: the html file you wanner run
- ``r, --remote``, run the tests by test center of taobao

Example:

.. code-block:: text

    $ uitest run -f test/go.js
    $ uitest run --file test/go.js
    $ uitest run -c http://demo.example.com/test.html
    $ uitest run -r -f test/go.js


.. note::
    ``-c, --html`` command you need to read :doc:`run html <html>`

    ``-r, --remote`` command requires a test server center (we call it utserver)

.. index:: start

start
-----

Start the server / do a single run

Example:

.. code-block:: text

    $ uitest start

.. note::

    this command requires a test server center (we call it utserver)


.. index:: plugin install

.. _cli-plugin:

plugin
------

Auto install browsers plugin

if it`s not work , you can install by yourself , the plugins path is:

- ``Chrome`` plugin is under `chrome store <https://chrome.google.com/webstore/detail/uitest-chrome-%E6%8F%92%E4%BB%B6/afgdnjlbpjonnjaeafdfkdoapmbogjco?hl=zh-CN&utm_source=chrome-ntp-launcher>`_
- ``Firefox`` plugin : {uitestDir}/plugin/firefox/uitest.xpi
- ``IE`` plugin : {uitestDir/plugin/ie/setup/setup.bat}
- ``Safari`` : {uitestDir/plugin/safari/uitest.safariextz}

.. warning::

    1. uitest not work well with Firefox.We are trying to reslove it.
    2. Only support mac safari , when you use ``uitest plugin`` to auto-install , the ``uitest.safariextz`` may be deleted by default...(Ah,suck it...)