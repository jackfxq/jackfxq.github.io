## 前言
观察者模式是我在学习和使用js中遇到的最多的一种设计模式了，那么什么是观察者模式呢？
>观察者模式又叫发布订阅模式（Publish/Subscribe），它定义了一种一对多的关系，让多个观察者对象同时监听某一个主题对象，这个主题对象的状态发生变化时就会通知所有的观察者对象，使得它们能够自动更新自己。

这是汤姆大叔关于观察者模式的一种[描述](http://www.cnblogs.com/TomXu/archive/2012/03/02/2355128.html)，在这篇博客里也讲的比较清楚，这里我就不重复去讲了，这篇文章我主要是讲讲我在学习和使用js的过程中都有那些地方用到了观察者模式
## 事件
事件就是一个典型的观察者模式，通过事件注册（订阅），事件触发（发布）完成事件的功能，这也是大家接触最多的一种观察者模式的运用。
## 路由
说到路由，就不得不提单页应用，路由主要就是应用在单页开发中，路由也是一个典型的观察者模式的应用，我们来看看一个简单的路由是怎么实现的
```javascript
function Router() {
    this.routes = {};
    this.currentUrl = '';
    this._init();
}

Router.prototype.route = function (path, callback) {
    this.routes[path] = callback || function () {};
};

Router.prototype.hashChangeFn = function () {
    this.currentUrl = location.hash.slice(1) || '/';
    this.routes[this.currentUrl]();
};

Router.prototype._init = function () {
    window.addEventListener('hashchange', this.hashChangeFn.bind(this), false);
};


//注册路由
var router = new Router();
router.route('/', function() {
    console.log('这是首页');
});
router.route('/test', function() {
    console.log('这是测试页');
});
```
这是一个简单的路由，没有做太多的处理，我们来看看那些是观察者（订阅者），那些是被观察者（发布者），很显然我们在注册路由时就是在添加一个个观察者，那么被观察着是谁呢，我们知道在`hash`变化的时候，我们需要改变页面的状态，也就是执行路由注册的`callback`，也就是说浏览器在`hash`变化的时候发布了`hashchange`事件，执行路由注册的`callback`，因此被观察着就是浏览器。
## vue数据双向绑定
vue数据的双向绑定也是一个典型的观察者模式，有关[vue数据的双向绑定的实现](https://github.com/jackfxq/blog/issues/2)，之前也有介绍，这部分代码比较多，这里就不贴出来了，大家可以看看下面这张vue官方教程关于[响应式原理的图](https://cn.vuejs.org/v2/guide/reactivity.html)
![](https://github.com/jackfxq/blog/raw/master/images/vue-data.png)<br>
vue数据初始化时对数据进行`observe`创建依赖的数组，视图进行挂载的时候创建watcher，并添加到这个依赖数组中，当数据改变时触发依赖数组中每一个依赖项`watcher`执行`update`方法，这就是vue数据双向绑定一个简单的流程说明，那么在这个过程中显然数据就是发布者，而`watcher`就是订阅者，依赖收集其实就是在收集订阅者。
## webpack
我们知道webpack的整个流程是用事件进行控制的，继承自Tapable，就是注册一个个插件，调用各种apply方法来触发plugin，这个过程中，plugin就是一个观察者，Tapable是个被观察者。
## 结语
观察者模式就是一种低耦合、高内聚的设计模式，使用观察者模式的代码具有较高的可维护性。