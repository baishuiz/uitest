.. _jasmine_module:

======================
The ``jasmine`` Module
======================

``jasmine``
-----------

see the `jasmine <http://pivotal.github.io/jasmine/>`_

``jasmine expand``
------------------

``simulate(selector,eventType)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**selector** ``String`` jquery selector

**eventType** ``String`` the type of event

uitest makes an heavy use of selectors in order to work with the `DOM <http://www.w3.org/TR/dom/>`_, and can transparently use either `CSS3 <http://www.w3.org/TR/selectors/>`_ or `XPath <http://www.w3.org/TR/xpath/>`_ expressions.

Example:
::

    simulate("#target","click")

``waitsMatchers(func,timeout)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**func**: ``Function`` you can write all your test scripts inside this callback function
**timeout**: ``Number`` you can write all your test scripts inside this callback function

UI test maybe a lot of async exec , jasmine can not be able to fit our requirements

we provide ``waitsMatchers`` function to solve this problem .

it well loop call the test function , until the test pass or timeout

Example:
::

    waitsMatchers(function(){
     expect("#tags").toExist();
    },60000);


``toHaveClass(className)``
~~~~~~~~~~~~~~~~~~~~~~~~~~

**className** ``String`` className

Example:

::

    expect("#target").toHaveClass("uitest")

will return true if the ``#target`` has class("uitest")

::

    toHaveClass:function (className) {
        var nodeList = jQuery(this.actual);
        return nodeList.hasClass(className);
    }

``toBeVisible()``
~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeVisible()

will return true if the ``#target`` is visible

::

    toBeVisible:function () {
            return jQuery(this.actual).is(':visible');
    }

``toBeHidden()``
~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeHidden()

will return true if the ``#target`` is hidden

::

    toBeHidden:function () {
        var nodeList = jQuery(this.actual);
        if(nodeList.size() ==0) return false;
        return nodeList.size() == nodeList.filter(':hidden').size();
    }



``toBeSelected()``
~~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeSelected()

will return true if the ``#target`` is selected

::

    toBeSelected:function () {
        var nodeList = jQuery(this.actual);
        if(nodeList.size() ==0) return false;
        return nodeList.filter(':selected').size() == nodeList.size();
    }


``toBeEmpty()``
~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeEmpty()

will return true if the ``#target`` is empty

::

    toBeEmpty: function () {
        var nodeList = jQuery(this.actual);
        if (nodeList.size() == 0) return false;
        return nodeList.filter(':empty').size() == nodeList.size();

    },

``toExist()``
~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toExist()

will return true if the ``#target`` is exist

::

    toExist: function () {
        var nodeList = jQuery(this.actual);
        return nodeList.size();
    }

``toHaveId(id)``
~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toHaveId('target')

will return true if the ``#target`` has id "target"

::

    toHaveId: function (id) {
        var nodeList = jQuery(this.actual);
        return nodeList.attr('id') == id;
    }


``toHaveHtml(html)``
~~~~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toHaveHtml("<em>123</em>")

will return true if the ``#target`` has html "<em>123</em>"

::

    toHaveHtml: function (html) {
        var nodeList = jQuery(this.actual);
        return jQuery.trim(nodeList.html()) == jQuery.trim(html);
    }

``toContainHtml(html)``
~~~~~~~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toContainHtml("<p>123</p>")

will return true if the ``#target`` is contains "<p>123</p>"

::

    toContainHtml: function (html) {
        var nodeList = jQuery(this.actual).first();
        var allHtml = nodeList.html() || "";

        return allHtml.indexOf(html) != -1;
    },

``toContainText(text)``
~~~~~~~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toContainText(123)

will return true if the ``#target`` is contains  text "123"

::

    toContainText: function (text) {
        var nodeList = jQuery(this.actual);
        var trimmedText = jQuery.trim(nodeList.text()) || "";

        return trimmedText.indexOf(text) != -1;
    }


``toHaveValue(value)``
~~~~~~~~~~~~~~~~~~~~~~
**value** ``String`` the value you wanna to test

Example:
::

    expect("#target").toHaveValue("123")

will return true if the ``#target`` is has value "123"

::

    toHaveValue: function (value) {
        var node = jQuery(this.actual).first();
        return  node.val() === value;
    }

``toBeDisabled()``
~~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeDisabled()

will return true if the ``#target`` is disabled

::

    toBeDisabled: function (selector) {
        var nodeList = jQuery(this.actual);
        if (nodeList.size() == 0) return false;
        return nodeList.filter(':disabled').size() == nodeList.size();
    }

``toBeFocused()``
~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toBeFocused()

will return true if the ``#target`` is being focused

::

    toBeFocused: function () {
        var nodeList = jQuery(this.actual);
        if (nodeList.size() == 0) return false;

        return nodeList.filter(':focus').size() == nodeList.size();
    }

``toHaveCSS``
~~~~~~~~~~~~~~~~~
Example:
::

    expect("#target").toHaveCSS("color","#fff")

will return true if the ``#target`` has css "color:#fff"

::

    toHaveCSS: function (styleProp, expectValue) {
        if (styleProp.match(/color/i)) {
            var tempNode = $('<div></div>');
            $('body').append(tempNode);
            $(tempNode).css(styleProp, expectValue);
            expectValue = $(tempNode).css(styleProp);
            tempNode.remove();
        }
        return jQuery(this.actual).first().css(styleProp) === expectValue;
    }

``atPosition(x, y, off, relativeEl)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
**x** ``String`` left value

**y** ``String`` top value

**off** ``String``
.. index:: position

Example:
::

    expect("#target").atPosition(0,0)

will return true if the ``#target`` is at position 0,0

::

    atPosition: function (x, y, off, relativeEl) {
        var tempOff = 0.1;
        var absX = Math.abs(x);
        var absY = Math.abs(y);
        var referPosition = {top: 0, left: 0};
        if (arguments[2] && typeof arguments[2] == 'number') {
            tempOff = arguments[2];
        }

        if (arguments[3] && typeof arguments[3] == 'string') {
            var referEl = jQuery(arguments[3]);
            if (referEl) {
                referPosition = referEl.offset();
            }


        }
        var nodeList = jQuery(this.actual);
        var actualPosition = nodeList.offset();
        var heightGap = nodeList.outerHeight() * tempOff;
        var widthGap = nodeList.outerWidth() * tempOff;
        return (Math.abs(Math.abs(actualPosition.top - referPosition.top) - absY) < heightGap) && ( Math.abs(Math.abs(actualPosition.left - referPosition.left) - absX) < widthGap);
    }



``toHaveComputedStyle(styleProp, expectValue)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. index:: computed style

Example:
::

    expect("#target").toHaveComputedStyle('color','#fff')

will return true if the ``#target`` has computed style

::

    toHaveComputedStyle: function (styleProp, expectValue) {

        if (styleProp.match(/color/i)) {
            var tempNode = $('<div></div>');
            $('body').append(tempNode);
            $(tempNode).css(styleProp, expectValue);
            expectValue = $(tempNode).css(styleProp);
            tempNode.remove();
        }
        return jQuery(this.actual).first().css(styleProp) === expectValue;
    },

``toHaveChildren(selector, num)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. index:: children

Example:
::

    expect("#target").toHaveChildren('#targetChild', 1)

will return true if the ``#target`` has 1 child which id is 'targetChild'

::

    toHaveChildren: function (selector, num) {
        return jQuery(this.actual).children(selector).length == num;
    },

``toHaveAttr(attributeName, expectedAttributeValue)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. index:: attr attribute

Example:
::

    expect("#target").toHaveAttr('class', 'target')

will return true if the ``#target`` has "class" that equal "target"

::

    toHaveAttr: function (attributeName, expectedAttributeValue) {
        var nodeList = jQuery(this.actual);
        if (nodeList.length == 0)return false;
        var result = true;
        jQuery.each(nodeList, function (index, item) {
            if (jQuery(item).attr(attributeName) != expectedAttributeValue) {
                result = false;
                return false;
            }
        })
        return result;
    }

``toHaveAttr(attributeName, expectedAttributeValue)``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. index:: attr attribute

Example:
::

    expect("#target").toHaveAttr('class', 'target')

will return true if the ``#target`` has "class" that equal "target"

::

    toHaveAttr: function (attributeName, expectedAttributeValue) {
        var nodeList = jQuery(this.actual);
        if (nodeList.length == 0)return false;
        var result = true;
        jQuery.each(nodeList, function (index, item) {
            if (jQuery(item).attr(attributeName) != expectedAttributeValue) {
                result = false;
                return false;
            }
        })
        return result;
    }
