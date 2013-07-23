.. _config:

.. index:: Config

============
Config
============


The config locates at {uitestDir}/uitest.conf.js,which created when you run :ref:`uitest run <cli-init>`

Browsers
--------

Assign the browsers you wanna test in

**type** ``Array``

**default** ``[]``

**available** ``["chrome","Firefox","IE6","IE7","IE8","IE9","Safari"]``

Example: ::

    browsers = ['Chrome'];

.. warning::

    You need to install your browser plugins see :ref:`plugin <cli-plugin>`

colors
------

Enable / disable colors in the output (reporters and logs)

**type** ``Boolean``

**default** ``true``

server
------

Server host

**type** ``String``

**default** ``uitest.taobao.net`` (this server can not be accessed out of Alibaba-inc)

serverPort
----------

Server host port

**type** ``Number``

**default** ``3031``



