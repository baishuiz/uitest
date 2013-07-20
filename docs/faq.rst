.. _faq:

.. index:: FAQ, Help

===
FAQ
===

.. contents:: Here's a selection of the most frequently asked questions by uitest newcomers:
   :local:
   :backlinks: top

.. index:: Node.js

Is uitest a `node.js <http://nodejs.org/>`_ library?
------------------------------------------------------

**No.** uitest is written base on `Node.js`_ , and is`s used for better auto ui test

.. index:: browser,progress,failure,error

Error:browser_process_failure
-----------------------------

1. Check if your browsers which used to test are closed before you run your test.

.. index:: listen,port,eaddrinuse,error

warn - error raised: Error: listen EADDRINUSE
---------------------------------------------

This error occurs because your port has been used,use :

::

    ps aux | grep node

and find the node uitest progress , and use `kill -9 {progressId}` to kill it.

.. index:: ie,https

ie ：SEC7111: HTTPS security is compromised by http://localhost:8080/static/uitest.js
---------------------------------------------------------------------------------------

`http://blogs.msdn.com/b/ieinternals/archive/2009/06/22/https-mixed-content-in-ie8.aspx?PageIndex=7 <http://blogs.msdn.com/b/ieinternals/archive/2009/06/22/https-mixed-content-in-ie8.aspx?PageIndex=7>`_

.. index:: Bugs, Contributing, error

I'm stuck! I think there's a bug! What can I do?
------------------------------------------------

Before rage-tweeting:

1. Read the `docs <http://uitest.github.io/docs/>`_
2. Check if an `issue <https://github.com/uitest/uitest/issues>`_ has been open about your problem already
3. Check you're running the `latest stable tag <https://github.com/uitest/uitest/tags>`_
4. Ask on the `project mailing list <yize.shc@gmail.com>`_:

   a. try to post a reproducible, minimal test case
   b. compare uitest results with native jasmine ones

5. Eventually, `file an issue <https://github.com/uitest/uitest/issues/new>`_.


What is the versioning policy of uitest?
------------------------------------------

Releases will follow the `SemVer standard <http://semver.org/>`_; they
will be numbered with the follow format:

.. code-block:: text

    <major>.<minor>.<patch>[-<identifier>]

And constructed with the following guidelines:

- Breaking backwards compatibility bumps the major
- New additions without breaking backwards compatibility bumps the minor
- Bug fixes and misc changes bump the patch
- Unstable, special and trunk versions will have a proper identifier

.. index:: jQuery

Can I use jQuery with uitest?
-------------------------------

Sure, you can use `jQuery <http://jquery.com/>`_, as every single other javascript library on Earth.

.. index:: log

Where does uitest write its logfile?
--------------------------------------

Nowhere. uitest doesn't write logs on the filesystem. You have to implement this by yourself if needed.

.. _faq_javascript:

Okay, honestly, I'm stuck with Javascript.
------------------------------------------

Don't worry, you're not alone. Javascript is a great language, but it's far more difficult to master than one might expect at first look.

Here are some great resources to get started efficiently with the language:

- Learn and practice Javascript online at `Code Academy <http://www.codecademy.com/tracks/javascript>`_
- `Eloquent Javascript <http://eloquentjavascript.net/contents.html>`_
- `JavaScript Enlightenment <http://www.javascriptenlightenment.com/JavaScript_Enlightenment.pdf>`_ (PDF)
- last, a `great tutorial on Advanced Javascript Techniques <http://ejohn.org/apps/learn/>`_ by John Resig, the author of jQuery. If you master this one, you're almost done with the language.