.. _installation:
.. index:: Installation

============
Installation
============

uitest can be installed on most Linuxes, OSX and Windows.

Prerequisites
-------------

.. index:: PhantomJS, Nodejs

- Node.js_ 0.8.0 or greater. Installation instructions can be found `here <http://nodejs.org/>`_

.. index:: git

Installing from npm
-------------------

Installation can be installed by:

.. code-block:: text

    $ npm i -g uitest

.. index:: git

Installing from git
-------------------

Installation can be achieved using `git <http://git-scm.com/>`_. The code is mainly hosted on `Github <https://github.com/uitest/uitest>`_.

From the master branch
~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

    $ git clone git://github.com/uitest/uitest.git
    $ cd uitest
    $ ln -sf `pwd`/bin/uitest /usr/local/bin/uitest
    $ npm install

Once uitest install on your machine,you should obtain something like this:

.. code-block:: text

    $ node -v
    v0.10.11
    $ uitest --version
    0.4.1
    # ...

Initialize uitest
-----------------

Now we should tell uitest which browser can be used and other options see also :doc:`config <config>`:

.. code-block:: text

    $ uitest init

.. warning::

    In Linuxes and MAC OS ,you should use ``sudo`` , so uitest can create the file


.. topic:: What did we just do?

   1. we created a new file `uitest.conf.js` which used to save your configs

.. index:: Windows

Install browsers plugin
-----------------------

We use browsers plugins to inject our own scripts to the browser,and the script is locate at `{uitestDir}/static/uitest.js`

.. code-block:: text

    $ uitest plugin

use it to auto-install your plugins,there may be are some issues,you can find the plugin under {uitestDir/plugin},you can install them yourself;

the chrome plugin can be downloaded here:`chrome store <https://chrome.google.com/webstore/detail/uitest-chrome-%E6%8F%92%E4%BB%B6/afgdnjlbpjonnjaeafdfkdoapmbogjco?hl=zh-CN&utm_source=chrome-ntp-launcher>`_

uitest on Windows
-------------------

Browsers Initialize additions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

we had met some issue on Windows,one was the ``PATH``, here is the solution:

- Append ``";C:\Program Files\Google\Chrome\Application\chrome.exe"`` to your ``PATH`` environment variable.
- Modify this path appropriately if you installed your browsers to a different location.

.. warning::

    if you run the command:**uitest init** and press tab to select the browsers you wanner choose,and press enter.(you can choose muti-browsers)
    if you see the  warning :
    No binary for [your browser]
    then you need to set your PATH

Known Bugs & Limitations
------------------------

- Due to its asynchronous nature, uitest doesn't work well with ``Firefox`` we are trying to resolve it.

.. _Node.js: http://nodejs.org/