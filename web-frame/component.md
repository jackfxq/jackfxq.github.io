## 前言
随着前端开发复杂度的日益提升，组件化开发应运而生，对于一个相对简单的活动页面开发如何进行组件化是本文的主要内容。
## 概述
下面我们看一下在zepto的基础上如何构建组件系统，首先，我们要解决第一个问题，如何引用一个组件，我们可以通过设置一个属性`data-component`来引用自定义的组件:
```html
<div data-component="my-component"></div>
```
那么如何向组件中传入数据呢，我们同样也可以通过设置属性来向组件传递数据，比如传入一个id值：
```html
<div data-component="my-component" data-id="1"></div>
```
那么组件之间如何进行通信呢，我们可以采用观察者模式来实现。
## 写一个组件
我们先来看看我们如何来写一个组件
```javaScript
//a.js
defineComponent('a', function (component) {
    var el = '<p class="a">input-editor</p>';
    var id = component.getProp('id');//获取参数id
    $(this).append(el);//视图渲染
    component.setStyle('.a{color:green}');//定义样式
    $(this).find('p').on('click', function () {
        component.emit('test', id, '2');//触发test
    });
});
```
我们先看看这个组件是怎么定义的，首先调用`defineComponent`（先不管这个函数在哪定义的）定义一个组件`a`，后面那个函数是组件`a`的组要逻辑，这个函数传入了一个`component`（先不管这个是哪来的，先看它能干啥），在前面我们说过如何向组件传递数据，在组件里我们通过`component.getProp('id')`来获取，样式我们通过`component.setStyle('.a{color:green}')`来定义，组件之前的通信我们通过`component.emit()`来触发（在别的组件里通过component.on()来注册），看上去我们基本解决了前面关于组件的一些问题，那么这个是怎么实现的呢？
## 组件实现原理
我们先来看看上面那个组件我们应该如何来实现，从上面定义一个组件来看有两个地方是比较关键的，一个是`defineComponent`是怎么实现的，一个就是`component`是什么。<br>
我们先来看看`defineComponent`是怎么实现的，很显然`defineComponent`必须定义为全局的（要不然`a.js`就无法使用了，而且必须在加载a.js之前定义`defineComponent`），我们来看看`defineComponent`的代码
```javaScript
//component.js
  var component = new Component();
  window.defineComponent = function (name, fn) {
        component.components[name] = {
            init: function () {
                //设置currentComponent为当前组件
                currentComponent = this;
                fn.call(this, component);
                component.init(this);
            }
        };
    }
```
这里我们可以看到定义了一个类`Component`，`component`是它的一个实例，`defineComponent`就是在`component.components`注册一个组件，这里的关键是`Component`类，我们来看看`Component`是怎么定义的
```javaScript
//component.js
  /**
     * Component类
     * @constructor
     */
    function Component() {
        this.components = {};//所有的组件
        this.events = {};//注册的事件
        this.loadStyle = {};
        this.init('body');//初始化
    }

    var currentComponent = null;//当前的组件
    /**
     * 类的初始化函数
     * @param container 初始化的范围，默认情况下是body
     */
    Component.prototype.init = function (container) {
        var self = this;
        container = container || 'body';
        $(container).find('[data-component]').each(function () {
            self.initComponent(this);
        });

    };
    /**
     *  初始化单个组件
     * @param context 当前组件
     */
    Component.prototype.initComponent = function (context) {

        var self = this;
        var componentName = $(context).attr('data-component');
        if (this.components[componentName]) {
            this.components[componentName].init.call(context);
        } else {
            _loadScript('http://' + document.domain + ':5000/dist/components/' + componentName + '.js', function () {
                self.components[componentName].init.call(context);
                //设置样式，同一个组件只设置一次
                if (!self.loadStyle[componentName] && self.components[componentName].style) {
                    $('head').append('<style>' + self.components[componentName].style + '</style>');
                    self.loadStyle[componentName] = true;
                }
            });
        }

    };
    /**
     * 设置样式
     * @param style 样式
     */
    Component.prototype.setStyle = function (style) {
        //获取当前组件的名称，currentComponent就是当前组件
        var currentComponentName = $(currentComponent).attr('data-component');
        var component = this.components[currentComponentName];
        if (component && !component.style) {
            component.style = style;
        }
    };
    /**
     * 获取组件参数
     * @param prop 参数名
     * @returns {*|jQuery}
     */
    Component.prototype.getProp = function (prop) {
        var currentComponentNme = $(currentComponent).attr('data-component');
        if ($(currentComponent).attr('data-' + prop)) {
            return $(currentComponent).attr('data-' + prop)
        } else {
            //属性不存在时报错
            throw Error('the attribute data-' + prop + ' of ' + currentComponentNme + ' is undefined or empty')
        }

    };
    /**
     * 注册事件
     * @param name 事件名
     * @param fn 事件函数
     */
    Component.prototype.on = function (name, fn) {
        this.events[name] = this.events[name] ? this.events[name] : [];
        this.events[name].push(fn);
    };
    /**
     * 触发事件
     */
    Component.prototype.emit = function () {
        var args = [].slice.apply(arguments);
        var eventName = args[0];
        var params = args.slice(1);
        if(this.events[eventName]){
            this.events[eventName].map(function (fn) {
                fn.apply(null, params);
            });
        }else{
            //事件不存在时报错
            throw Error('the event ' + eventName + ' is undefined')
        }

    };
    /**
     * 动态加载组价
     * @param url 组件路径
     * @param callback 回调函数
     * @private
     */
    function _loadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (typeof(callback) != "undefined") {
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                        $(script).remove();
                    }
                };
            } else {
                script.onload = function () {
                    callback();
                    $(script).remove();
                };
            }
        }
        script.src = url;
        $('body').append(script);
    }
```
我们先了解一下大概的流程
![](https://github.com/jackfxq/blog/raw/master/images/process.png)<br>
大致的流程就是上面这张流程图了，我们所有的组件都是注册在`component.components`里，事件都是在`component.events`里面。<br>
我们回头看一下组件components里头的init方法
```javaScript
//component.js
  var component = new Component();
  window.defineComponent = function (name, fn) {
        component.components[name] = {
            init: function () {
                //设置currentComponent为当前组件
                currentComponent = this;
                fn.call(this, component);
                component.init(this);
            }
        };
    }
```
首先，将this赋给currentComponent，这个在哪里会用到呢？在个getProp和setStyle这两个方法里都用到了
```javaScript
//component.js
        /**
     * 设置样式
     * @param style 样式
     */
    Component.prototype.setStyle = function (style) {
        console.log(currentComponent);
        //获取当前组件的名称，currentComponent就是当前组件
        var currentComponentName = $(currentComponent).attr('data-component');
        var component = this.components[currentComponentName];
        if (component && !component.style) {
            component.style = style;
        }
    };
    /**
     * 获取组件参数
     * @param prop 参数名
     * @returns {*|jQuery}
     */
    Component.prototype.getProp = function (prop) {
        return $(currentComponent).attr('data-' + prop)
    };
```
到这里大家可能会对this比较疑惑，这个this到底是什么，我们可以先看在那个地方调用了组件的init方法
```javaScript
//component.js
        /**
     *  初始化单个组件
     * @param componentName 组件名
     * @param context 当前组件
     */
    Component.prototype.initComponent = function (componentName, context) {

        var self = this;
        if (this.components[componentName]) {
            this.components[componentName].init.call(context);
        } else {
            _loadScript('http://' + document.domain + ':5000/components/' + componentName + '.js', function () {
                self.components[componentName].init.call(context);
                //设置样式，同一个组件只设置一次
                if (!self.loadStyle[componentName] && self.components[componentName].style) {
                    $('head').append('<style>' + self.components[componentName].style + '</style>');
                    self.loadStyle[componentName] = true;
                }
            });
        }

    };
```
就是在单个组件初始化的调用了init方法，这里有call改变了init的this，使得this=context,那么这个context又是啥呢
```javaScript
//component.js
       /**
     * 类的初始化函数
     * @param container 初始化的范围，默认情况下是body
     */
    Component.prototype.init = function (container) {
        var self = this;
        container = container || 'body';
        $(container).find('[data-component]').each(function () {
            var componentName = $(this).attr('data-component');
            console.log(this);
            self.initComponent(componentName, this);
        });

    };
```
context其实就是遍历的每一个组件，到这里我们回过头来看看我们是怎么定义一个组件
```javaScript
//b.js
defineComponent('b', function (component) {
    var el = '<p class="text-editor">text-editor</p></div><div data-component="a" data-id="1"></div>';
    $(this).append(el);
    component.on('test', function (a, b) {
        console.log(a + b);
    });
    var style = '.text-editor{color:red}';
    component.setStyle(style)
});
```
我们知道this就是组件本身也就是下面这个
```html
<div data-component="b"></div>
```
这个组件通过`component.on`注册了一个`test`事件，在前面我们知道test事件是在`a`组件触发的，到这里我们就把整个组件系统框架开发完成了，下面就是一个个去增加组件就好了，整个的代码如下：
```javaScript
//component.js
(function () {
    /**
     * Component类
     * @constructor
     */
    function Component() {
        this.components = {};//所有的组件
        this.events = {};//注册的事件
        this.loadStyle = {};
        this.init('body');//初始化
    }

    var currentComponent = null;//当前的组件
    /**
     * 类的初始化函数
     * @param container 初始化的范围，默认情况下是body
     */
    Component.prototype.init = function (container) {
        var self = this;
        container = container || 'body';
        $(container).find('[data-component]').each(function () {
            self.initComponent(this);
        });

    };
    /**
     *  初始化单个组件
     * @param context 当前组件
     */
    Component.prototype.initComponent = function (context) {

        var self = this;
        var componentName = $(context).attr('data-component');
        if (this.components[componentName]) {
            this.components[componentName].init.call(context);
        } else {
            _loadScript('http://' + document.domain + ':5000/dist/components/' + componentName + '.js', function () {
                self.components[componentName].init.call(context);
                //设置样式，同一个组件只设置一次
                if (!self.loadStyle[componentName] && self.components[componentName].style) {
                    $('head').append('<style>' + self.components[componentName].style + '</style>');
                    self.loadStyle[componentName] = true;
                }
            });
        }

    };
    /**
     * 设置样式
     * @param style 样式
     */
    Component.prototype.setStyle = function (style) {
        //获取当前组件的名称，currentComponent就是当前组件
        var currentComponentName = $(currentComponent).attr('data-component');
        var component = this.components[currentComponentName];
        if (component && !component.style) {
            component.style = style;
        }
    };
    /**
     * 获取组件参数
     * @param prop 参数名
     * @returns {*|jQuery}
     */
    Component.prototype.getProp = function (prop) {
        var currentComponentNme = $(currentComponent).attr('data-component');
        if ($(currentComponent).attr('data-' + prop)) {
            return $(currentComponent).attr('data-' + prop)
        } else {
            //属性不存在时报错
            throw Error('the attribute data-' + prop + ' of ' + currentComponentNme + ' is undefined or empty')
        }

    };
    /**
     * 注册事件
     * @param name 事件名
     * @param fn 事件函数
     */
    Component.prototype.on = function (name, fn) {
        this.events[name] = this.events[name] ? this.events[name] : [];
        this.events[name].push(fn);
    };
    /**
     * 触发事件
     */
    Component.prototype.emit = function () {
        var args = [].slice.apply(arguments);
        var eventName = args[0];
        var params = args.slice(1);
        if(this.events[eventName]){
            this.events[eventName].map(function (fn) {
                fn.apply(null, params);
            });
        }else{
            //事件不存在时报错
            throw Error('the event ' + eventName + ' is undefined')
        }

    };
    /**
     * 动态加载组价
     * @param url 组件路径
     * @param callback 回调函数
     * @private
     */
    function _loadScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (typeof(callback) != "undefined") {
            if (script.readyState) {
                script.onreadystatechange = function () {
                    if (script.readyState == "loaded" || script.readyState == "complete") {
                        script.onreadystatechange = null;
                        callback();
                        $(script).remove();
                    }
                };
            } else {
                script.onload = function () {
                    callback();
                    $(script).remove();
                };
            }
        }
        script.src = url;
        $('body').append(script);
    }

    var component = new Component();

    window.defineComponent = function (name, fn) {
        component.components[name] = {
            init: function () {
                //设置currentComponent为当前组件
                currentComponent = this;
                fn.call(this, component);
                component.init(this);
            }
        };
    }

})();
```
## 工程化
上面搭建的组件系统有个不好的地方，就是我们定义的`html`和`style`都是字符串，对于一些大的组件来说，`html`和`style`都是非常长的，这样的话调试就会很困难，因此，我们需要对组件系统进行工程化，最终目标是`html`，`js`和`css`可以分开开发，现有的工程化工具比较多，你可以用`gulp`或者`node`自己写一个工具，这里介绍一下如何使用`node`来实现组件系统的工程化。<br>
我们先来看看目录结构
![](https://github.com/jackfxq/blog/raw/master/images/component.png)<br>
我们首先要获取到编译前组件的路径
```javaScript
//get-path.js
var glob = require('glob');
exports.getEntries = function (globPath) {
    var entries = {};
    /**
     * 读取src目录,并进行路径裁剪
     */
    glob.sync(globPath).forEach(function (entry) {
        var tmp = entry.split('/');
        tmp.shift();
        tmp.pop();
        var pathname = tmp.join('/'); // 获取前两个元素

        entries[pathname] = entry;

    });

    return entries;
};
```
然后根据路径分别读取`index.js`,`index.html`,`index.css`
```javaScript
//read-file.js
var readline = require('readline');
var fs = require('fs');

exports.readFile = function (file, fn) {
    console.log(file);
    var fRead = fs.createReadStream(file);
    var objReadline = readline.createInterface({
        input: fRead
    });
    function trim(str) {
        return str.replace(/(^\s*)|(\s*$)|(\/\/(.*))|(\/\*(.*)\*\/)/g, "");
    }
    var fileStr = '';
    objReadline.on('line', function (line) {
        fileStr += trim(line);
    });
    objReadline.on('close', function () {
        fn(fileStr)
    });
};


//get-component.js
var fs = require('fs');
var os = require('os');

var getPaths = require('./get-path.js');
var routesPath = getPaths.getEntries('./src/components/**/index.js');

var readFile = require('./read-file');

for (var i in routesPath) {
    (function (i) {
        var outFile = i.replace('src', 'dist');
        readFile.readFile(i + '/index.js', function (fileStr) {
            var js = fileStr;
            readFile.readFile(i + '/index.html', function (fileStr) {
                js = js.replace('<html>', fileStr);
                readFile.readFile(i + '/index.css', function (fileStr) {
                    js = js.replace('<style>', fileStr);
                    var writeRoutes = fs.createWriteStream(outFile + '.js');
                    writeRoutes.write(js);
                });
            });

        });
    })(i)
}
```
将`index.html`和`index.css`转化成字符串插入到`index.js`中，我们看看`index.js`
```javaScript
// a/index.js
defineComponent('a', function (component) {
    var el = '<html>';
    var id = component.getProp('id');//获取参数id
    $(this).append(el);//视图渲染
    var style = '<style>';
    component.setStyle(style);//定义样式
    $(this).find('p').on('click', function () {
        component.emit('test', id, '2');//触发test
    })
});
```
将`<html>`，`<style>`替换成之前`index.html`和`index.css`转化的字符串，最后对`componets`文件夹下面的文件进行监控
```javaScript
//component-watch.js
var exec = require('child_process').exec;
var chokidar = require('chokidar');

console.log('开始监听组件...');

chokidar.watch('./src/components/**/**').on('change', function (path) {
    console.log(dateFormat(new Date(), 'yyyy-M-d h:m:s') + ':' + path + '变化了...');

    exec('node get-component.js', function (err, out, code) {
        console.log(dateFormat(new Date(), 'yyyy-M-d h:m:s') + ':' + '编译完成...');
    });

});

//时间格式化
function dateFormat(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
```
到这里组件系统的工程化就完成了。
具体代码在[这里](https://github.com/jackfxq/zepto-template)