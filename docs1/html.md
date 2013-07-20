# 使用--html
这个类型比较特殊，是当你页面本身就有测试脚本，有测试页面，如果要使用这样的类型，需要注意什么呢？

1. 页面中自行引入jasmine，主要包括两个文件`jasmine.js`和`jasmine-html.js`

    重要：

    我们对jasmine-html.js进行了改造，请用[http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/client/to3party/jasmine-html.js](http://gitlab.alibaba-inc.com/uitest/uitest/blob/master/client/to3party/jasmine-html.js)

2. 配置参考：

    ```
    http://gitlab.alibaba-inc.com/yize/demo/blob/master/uitest/etao/index.htm
    ```

    如何运行？

    ```
    uitest run --html xxx.html //你的demo地址
    ```

    不想这么麻烦？那就用

    ```
    uitest run -f xxx.js
    ```


有问题欢迎联系：

伊泽s