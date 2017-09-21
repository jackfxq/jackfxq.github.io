## 前言
刚来公司那会接触最多的业务需求就是活动页面的开发，早期公司对于活动页面H5的开发的技术栈就是zepto+less+gulp+一套自己的组件系统，页面的渲染还是原始的字符串拼接技术，其维护性大家都懂的。。。，后来我开始引入模板引擎，早期有考虑引入mustache,但是考虑活动H5只是一些简单的交互和页面渲染，有很多mustache的功能用不到，第二就是不够灵活，因为我不太想通过逐个选择DOM，然后绑定事件的方式，最后考虑自己造轮子，做了一个简易的前端模板引擎，并且把事件的绑定做到框架里，下面我们先看看一个简单的demo<br>
index.html
```html
<div class="main hide">
    <div>
        {{ list.map(function(item,index){ }}
            <div @click="click({{index}},{{item.tag}})">{{item.tag}}</div>
        {{ }}) }}
    </div>
</div>

<script type='text/javascript' src='./zepto.js'></script>
<script type='text/javascript' src='./render.js'></script>
<script type='text/javascript' src='./index.js'></script>
```
index.js
```javascript
$(function () {
    new Render({
        el: '.main',
        data: {
            num: 1,
            list: [{
                tag: 'aa'
            }, {
                tag: 'bb'
            }, {
                tag: 'cc'
            }]
        },
        methods: {
            click: function (index, tag, e) {
                console.log(index, tag, e);
            }
        }
    });
});
```
从demo我们可以看到数据的定义有点像vue（其实也是参考了vue。。。），但是这只是个基于zepto的简易的模板引擎，是没有数据的双向绑定的，这里通过`@`来绑定事件，通过`{{}}`来传递参数,如demo中遍历了一个数组，并为每一项绑定了一个click事件，将index和item.tag作为参数传了进去，还把事件的event对象作为最后一个参数传入，我们可以看看效果：<br>
![](https://github.com/jackfxq/blog/raw/master/images/result.png)<br>
这套简易的开发框架主要定义了一个Render对象，这个Render对象就定义在render.js里，我们先看看render.js是咋样的
```javascript
(function () {

    function Render(option) {
        this.option = option;
        this._template = '';
        this._init();
    }
    /**
     * 初始化
     */
    Render.prototype._init = function () {
        $(this.option.el).html(this._render($(this.option.el), this.option.data));//视图渲染
        $(this.option.el).show();
        var _this = this;
        $('[data-on]').each(function () {
            var eventStr = $(this).attr('data-on');
            var eventType = eventStr.split('-')[0].replace(/\s/g, '');
            var event = eventStr.split('-')[1].replace(/\s/g, '').match(/(\w+)(.*|\((.+)\))/);
            var method = event[1];
            var params = event[2].match(/\((.*)\)/) ? event[2].match(/\((.*)\)/)[1] : '';
            var args = params.split(',');
            $(this).on(eventType, function (e) {
                args.push(e);
                _this.option.methods[method].apply(this, args);
            });
            $(this).removeAttr('data-on');
        })
    };
    /**
     * 模板渲染
     * @param $el 渲染的html模板
     * @param {object} data 渲染的数据
     * @returns {string} 生成的html字符串
     */
    Render.prototype._render = function ($el, data) {
        if (!this._template) {
            this._template = $el.html();
        }
        var template = this._template ? this._template : $el.html();
        var tokenizeArray = _tokenize(template);
        var parameter = [];
        var args = [];
        var ret = ['var strArray = []'];
        for (var i = 0, token; token = tokenizeArray[i++];) {
            if (token.type === 'text') {
                ret.push("strArray.push('" + token.expr + "')");
            } else if (token.type === 'logic') {
                ret.push(token.expr);
            } else {
                ret.push("strArray.push(" + token.expr + ")");
            }
        }
        ret.push("return strArray");
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                parameter.push(key);//形参
                args.push(data[key]);//数据
            }
        }
        var renderArrayFunction = new Function(parameter.join(','), ret.join('\n'));//渲染函数
        var renderArray = renderArrayFunction.apply(this, args);
        var dataOnAttrStr = renderArray.join('').replace(/@(\w+)="([^"]*)"/g, 'data-on="$1-$2"');
        return dataOnAttrStr;
    };
    /**
     *生成渲染单元数组
     * @param {string} str 模板html字符串
     * @returns {Array} 渲染单元数组
     */
    function _tokenize(str) {
        var openTag = '{{';
        var closeTag = '}}';
        var ret = [];
        var value = '';
        do {
            var index = str.indexOf(openTag);
            index = index === -1 ? str.length : index;
            value = str.slice(0, index);
            ret.push({//抽取{{前面的静态内容
                expr: value.trim().replace(/[\r\n]/g, ""),//去除换行符
                type: 'text'
            });
            str = str.slice(index + openTag.length);//改变str字符串自身
            if (str) {
                index = str.indexOf(closeTag);
                value = str.slice(0, index);
                if (/^(\s+)/.test(value)) {//抽取{{与}}的动态内容
                    ret.push({
                        expr: _antiEscape(value),
                        type: 'logic'
                    });
                } else {
                    ret.push({
                        expr: value,
                        type: 'js'
                    });
                }
                str = str.slice(index + closeTag.length);//改变str字符串自身
            }
        } while (str.length);
        return ret
    }

    /**
     * 反转义
     * @param {string} str
     * @returns {string|string}
     */
    function _antiEscape(str) {
        var elem = document.createElement('div');
        elem.innerHTML = str;
        return elem.innerText || elem.textContent;
    }

    window.Render = Render;

})(window);
```
包含注释大概100来行代码（mustache有600来行代码）就完成了模板的编译和事件的绑定。下面我们具体看一下是怎么实现的。
## 模板编译
字符模板的编译大家可以先看看[这里](https://segmentfault.com/a/1190000006990480)，文章里讲的比较详细，字符模板引擎可以理解为一个字符串编译器，主要分两步：词法分析和语义分析。
### 词法分析
主要是_tokenize函数，我们还是以demo为例看看经过_tokenize之后生成了什么，下图为_tokenize运行之后的结果：<br>
![](https://github.com/jackfxq/blog/raw/master/images/render-1.png)<br>
在这里，`type`就只有三种类型：`text`,`js`,`logic`,其中`text`是字符串类型不进行任何的操作，`js`进行赋值操作，`logic`进行一些逻辑操作。判断的条件是定界符`{{}}`左右两边的字符串是`text`之间的根据第一个字符是否为空格判断，第一个字符是空格则为`logic`，否则为`js`<br>
### 语义分析
主要是_render函数，我们可以看看运行_render后的效果：
![](https://github.com/jackfxq/blog/raw/master/images/render-2.png)<br>
这个是怎么实现的呢，我们具体看看_render的代码，_render其实就是完成两件事情：<br>
1.根据type将相应的字符串push到数组中；<br>
2.根据传入的data生成函数的形参和实参，然后使用new Function（）生成渲染函数，最后将@click编译成data-on属性，data-on的属性用于给DOM绑定事件，如下图：<br>
![](https://github.com/jackfxq/blog/raw/master/images/render-3.png)<br>
![](https://github.com/jackfxq/blog/raw/master/images/render-4.png)<br>
### 事件绑定
最后一步就是事件绑定，代码在`_init()`里面，代码如下：
```javascript
 /**
     * 初始化
     */
    Render.prototype._init = function () {
        $(this.option.el).html(this._render($(this.option.el), this.option.data));//视图渲染
        $(this.option.el).show();
        var _this = this;
        $('[data-on]').each(function () {
            var eventStr = $(this).attr('data-on');
            var eventType = eventStr.split('-')[0].replace(/\s/g, '');
            var event = eventStr.split('-')[1].replace(/\s/g, '').match(/(\w+)(.*|\((.+)\))/);
            var method = event[1];
            var params = event[2].match(/\((.*)\)/) ? event[2].match(/\((.*)\)/)[1] : '';
            var args = params.split(',');
            $(this).on(eventType, function (e) {
                args.push(e);
                _this.option.methods[method].apply(this, args);
            });
            $(this).removeAttr('data-on');
        })
    };
```
整个init做了两个事件：<br>
1.视图渲染，将前面编译生成的字符插入相应的位置；
2.遍历含有data-on的DOM，根据data-on属性，利用正则将事件类型`eventType`，在前面定义的`methods`（就是new Render()里面定义的methods）中的属性method以及里面的参数`params`提取出来,可以看一下本demo提取的`eventType`,`methods`,`params`分别是什么<br>
![](https://github.com/jackfxq/blog/raw/master/images/render-5.png)<br>
最后用on对DOM进行事件绑定。
## 结语
本文介绍了一下如何在zepto的基础上搭建简易的模板引擎（有些简陋。。。），你也可以直接引入其他的第三方的模板引擎，不用自己造轮子，不过灵活性就不高了，自己写的模板引擎可以根据自己的需求进行改写，比如用zepto时我不太喜欢通过js选择一个DOM元素在绑定一个事件，我觉得这样的代码有些乱不好维护，特别是交互比较多的时候，所以我把事件绑定也做到引擎里面，这样就不需要我在一个个去绑定了，定义好`methods`就好了，至于我为啥不用vue，是因为我觉得我们在选择技术栈时，应该根据具体的业务需求进行选择，对于一些简单的活动H5来说用zepto，在加上一些简易的框架就足够了。。。。