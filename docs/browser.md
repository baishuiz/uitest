## 浏览器

### 设置浏览器

打开浏览器是件浪费时间的事情，现在UITest会自动帮你打开浏览器，你要做的只是做些配置

```
(sudo) uitest init
```
或者直接修改`uitest.conf.js`（这个文件只有当你使用过`uitest init`才会生成）

```
browsers = ['Chrome'];
```

目前支持的浏览器有：

* Chrome
* Safari
* Firefox
* Opera
* IE
* PhantomJS

### 指定浏览器BIN文件路径

UITest有默认路径，但是当这些默认路径找不到你的浏览器的时候，你可以打开`lib/lauchers`找到定义文件。
你可以设置`<BROWSER>_BIN`环境变量，或者设置个软链。

### POSIX shells

```
# Changing the path to the Chrome binary
$ export CHROME_BIN=/usr/local/bin/my-chrome-build

# Changing the path to the Chrome Canary binary
$ export CHROME_CANARY_BIN=/usr/local/bin/my-chrome-build

# Changing the path to the PhantomJs binary
$ export PHANTOMJS_BIN=$HOME/local/bin/phantomjs
```

### Windows cmd.exe

```
C:> SET IE_BIN=C:\Program Files\Internet Explorer\iexplore.exe
```

### Windows Powershell

```
$Env:FIREFOX_BIN = 'c:\Program Files (x86)\Mozilla Firefox 4.0 Beta 6\firefox.exe'
```




