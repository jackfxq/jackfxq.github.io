## 简单的js webpack打包结果
一直对webpack打包后的文件是怎么运行的比较感兴趣，本文将从简单的webpack打包开始，看看打包后的文件运行的原理，这里准备了一个打包前的文件`main.js`
```javascript
//main.js
console.log(1)
```
`main.js`就是很简单的打印出一个1，我们看看打包后的文件如下：
```javascript
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {


console.log(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
```
可以看出，打包后的`js`是一个自执行的函数，传入的是一个数组，这里我称`agrs`，里头有两个函数，第一个就是打包前的`main.js`的内容，第二个就是执行一个函数`__webpack_require__(0)`，我先不管这个`__webpack_require__`这个是干啥的，先往下看，我们先看看自执行函数，首先传入函数的形参是`modules`就是前面说的两个函数，然后定义了一个`__webpack_require__`函数（就是第二个函数里面执行的那个函数），`__webpack_require__`函数传入一个moduleId，这个moduleId就是传入自执行的函数那个数组的`index`。
下面我们看看自执行的函数里面执行了啥，前面都是些定义，只有在自执行的函数最后一行代码`return __webpack_require__(__webpack_require__.s = 1);`里头执行了`__webpack_require__`，传入的参数是1。
我们在看看`__webpack_require__`干了个啥，`__webpack_require__`先检查一下installedModules中是否已经加载过这个module,如果有就直接返回module.export，如果不是我们就继续执行下面的代码，下面定义了module对象，有`i`就是moduleId,`l`表示是否加载完毕，`exports`表示输出的结果，然后执行`modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);`这句代码就是执行`agrs`里的函数，传入三个参数`module`，`module.exports`，`__webpack_require__`。
好了现在我们可以看看`__webpack_require__(__webpack_require__.s = 1)`是怎么执行的，传入1也就是第二个module,里面又执行了`__webpack_require__(0)`，也就是第一个模块`console.log(1);`
至此，一个简单的流程就走通了。。。
## 含有import的js webpack打包结果
下面我们看看使用了require的js打包后的结果，`main.js`如下：
//main.js
import b from './b.js';
b.say();
console.log(1);

//b.js
let b = {
    say: function () {
        console.log('b')
    }
};

export default b;
```
我们看看打包后的js
```javascript
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b_js__ = __webpack_require__(2);

__WEBPACK_IMPORTED_MODULE_0__b_js__["a" /* default */].say();

console.log(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
var b = {
    say: function say() {
        console.log('b');
    }
};

/* harmony default export */ __webpack_exports__["a"] = b;

/***/ })
/******/ ]);
```
从打包的js来看，自执行函数基本没变化，其传入的参数增加了一个既b.js的内容，我们从前面的分析自动，每个模块都会执行一次，每次执行都会在定义一个对象module,在执行每个模块时，都会传入三个参数`module`，`module.exports`，`__webpack_require__`。
在执行`__webpack_require__`时都会将`return module.exports`,也就是说每个模块在执行的时候，第二个参数的赋值都会在执行`__webpack_require__(moduleId)`函数是返回，如上例中第三个模块的第二个参数是`__webpack_exports__`，其赋值为`__webpack_exports__["a"] = b;`，在第一个模块中我们看到引用第三个模块的代码是`var __WEBPACK_IMPORTED_MODULE_0__b_js__ = __webpack_require__(2);`，由于`__webpack_require__(2);`返回的是第三个模块第二个参数，因此`__WEBPACK_IMPORTED_MODULE_0__b_js__`等于第三个模块的`__webpack_exports__`。
### 结语
从上面的分析来看，webpack打包后的js就是一个自执行函数，将所有的模块(就是个函数)都传入到自执行函数中，那个模块要export数据（如`b.js`中的`export b`），就对这个模块的函数第二个参数赋值，引入这个模块时(如main.js中的import)执行以下`__webpack_require__(moduleId)`函数就可以将moduleId模块export的数据拿到。