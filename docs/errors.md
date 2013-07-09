# 常见错误QA

### browser_process_failure

如果出现这个错误，基本上都是因为浏览器没有关闭。

### warn  - error raised: Error: listen EADDRINUSE

这个错误是由于socket.io通信端口被占据，可以使用

```
ps aux | grep node
```

找到对应的程序，`kill`之


### ie下提示：SEC7111: HTTPS 安全受到 http://localhost:8080/static/uitest.js 的威胁

解决方案，选项-Internet选项-安全-自定义级别-显示混合内容（启用）

ISSUE:[#2577](http://gitlab.alibaba-inc.com/uitest/uitest/issues/2577)
参考链接[http://blogs.msdn.com/b/ieinternals/archive/2009/06/22/https-mixed-content-in-ie8.aspx?PageIndex=7](http://blogs.msdn.com/b/ieinternals/archive/2009/06/22/https-mixed-content-in-ie8.aspx?PageIndex=7)

### ipv6环境下，不能运行的BUG

如果开启了ipv6模式，可能会出现`localhost:8080`访问不到文件的问题，解决方法：

- 将hosts中，ipv6的alias去除

```shell
127.0.0.1       localhost
255.255.255.255 broadcasthost
#下面两行注释掉。
#::1             localhost
#fe80::1%lo0     localhost
```