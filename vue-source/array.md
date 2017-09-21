

在阅读vue的教程中关于列表渲染的内容的时候对数组的更新做了特殊的说明：<br>

<p class="tip">
由于 JavaScript 的限制， Vue 不能检测以下变动的数组：<br>
1.当你利用索引直接设置一个项时，例如： vm.items[indexOfItem] = newValue,<br>
2.当你修改数组的长度时，例如： vm.items.length = newLength<br>
</p>


只能通过如下七个变异的方法才能触发视图更新

>push()<br>
pop()<br>
shift()<br>
unshift()<br>
splice()<br>
sort()<br>
reverse()<br>

初看这部分时就非常好奇对于数组vue是怎么处理的，于是查看了一下vue的源码关于这部分的内容:
```javascript
var Observer = function Observer (value) {
  this.value = value;
  this.dep = new Dep();
  this.vmCount = 0;
  def(value, '__ob__', this);
  if (Array.isArray(value)) {
    var augment = hasProto
      ? protoAugment
      : copyAugment;
    augment(value, arrayMethods, arrayKeys);
    this.observeArray(value);
  } else {
    this.walk(value);
  }
};
```
我们可以看到，在创建observe时对数组进行了特殊的处理，就是下面这部分代码：
```javascript
 var augment = hasProto
      ? protoAugment
      : copyAugment;//判断是否有__proto__属性，有的话hasProto=true
    augment(value, arrayMethods, arrayKeys);

//protoAugment
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src;
  /* eslint-enable no-proto */
}
//copyAugment
/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (var i = 0, l = keys.length; i < l; i++) {
    var key = keys[i];
    def(target, key, src[key]);
  }
}
```
从上面的代码我们可以看出augment的作用就是在chrome或者ff中给`value.__proto__=arrayMethods`（chrome和FF都可以访问到对象的`__proto__`属性，IE不可以，所有用IE访问时`augment=copyAugment`），下面我们看看`arrayMethods`是啥，代码如下：
```javascript
var arrayProto = Array.prototype;
var arrayMethods = Object.create(arrayProto);[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method];
  def(arrayMethods, method, function mutator () {
    var arguments$1 = arguments;

    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length;
    var args = new Array(i);
    while (i--) {
      args[i] = arguments$1[i];
    }
    var result = original.apply(this, args);
    var ob = this.__ob__;
    var inserted;
    switch (method) {
      case 'push':
        inserted = args;
        break
      case 'unshift':
        inserted = args;
        break
      case 'splice':
        inserted = args.slice(2);
        break
    }
    if (inserted) { ob.observeArray(inserted); }
    // notify change
    ob.dep.notify();
    return result
  });
});
```
查看上面的代码，这里使用了Object.create(),那么这个Object.create()有啥用呢，就是将传入的参数作为新对象的原型对象，行为和下面的代码是一样的：
```javascript
function object(o) {
    function F();
    F.property = o;
    return new F()
}
```
其实就是将`arrayMethods`的原型指向`arrayProto`也就是`Array.prototype`，然后在`arrayMethods`里头复写七个方法，那么这样的话在数组调用push方法时将调用`arrayMethods.push`而不在调用`Array.prototype.push`，相当于用`arrayMethods`拦截了`Array.prototype`的七个方法，在`arrayMethods.push`中我们调用了`ob.dep.notify();`这个就是更新视图的操作。