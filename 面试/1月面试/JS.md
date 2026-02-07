## 一、变量类型

**Q: 如何判断一个变量是数组？**

```javascript
// 方法1：Array.isArray()（推荐）
Array.isArray([])  // true

// 方法2：instanceof
[] instanceof Array  // true

// 方法3：Object.prototype.toString
Object.prototype.toString.call([]) === '[object Array]'

// 方法4：constructor
[].constructor === Array  // true
```

**Q: null 和 undefined 的区别？**

```javascript
// null：表示"空值"，是一个被赋予的值
let a = null  // 主动赋值为空

// undefined：表示"未定义"
let b         // 声明但未赋值
function fn(x) { console.log(x) }
fn()          // undefined，参数未传

// 类型
typeof null       // 'object'
typeof undefined  // 'undefined'

// 转数字
Number(null)      // 0
Number(undefined) // NaN
```

## 二、变量与作用域
```js
// 经典面试题：循环中的 var
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：3, 3, 3

// 解决方案1：let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)
}
// 输出：0, 1, 2
```

## 三、闭包
闭包让函数"记住"了它被创建时的环境（词法作用域）。

### 1.2 闭包的形成条件
1. 函数嵌套
2. 内部函数引用外部函数的变量
3. 内部函数被返回或传递到外部


### 防抖和节流
#### 防抖：
事件触发后，等待一段时间再执行。如果在等待期间再次触发，则重新计时。就像电梯门——有人进来就重新等待，直到没人进来才关门。

```javascript
// 防抖：延迟执行，重复触发重新计时
function debounce(fn, delay, immediate = false) {
  let timer = null
  
  return function(...args) {
    const context = this
    
    if (timer) clearTimeout(timer)
    
    if (immediate && !timer) {
      fn.apply(context, args)
    }
    
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(context, args)
      }
      timer = null
    }, delay)
  }
}
```

##### 防抖场景（只关心最终结果）:
```js
// 1. 搜索框输入
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce((e) => {
  fetchSearchResults(e.target.value);
}, 500));

// 2. 窗口 resize 完成后重新计算布局
window.addEventListener('resize', debounce(() => {
  recalculateLayout();
}, 300));

// 3. 表单验证
const emailInput = document.getElementById('email');
emailInput.addEventListener('input', debounce((e) => {
  validateEmail(e.target.value);
}, 500));

// 4. 按钮防重复点击
submitBtn.addEventListener('click', debounce(() => {
  submitForm();
}, 1000, true)); // immediate=true，首次立即执行

```
#### 节流：
事件触发后，在固定时间间隔内只执行一次。就像水龙头滴水——无论怎么拧，每秒只滴一滴。
```js
// 节流：固定频率执行
function throttle(fn, delay) {
  let lastTime = 0
  let timer = null
  
  return function(...args) {
    const context = this
    const now = Date.now()
    const remaining = delay - (now - lastTime)
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      fn.apply(context, args)
      lastTime = now
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args)
        lastTime = Date.now()
        timer = null
      }, remaining)
    }
  }
}
```
##### 节流场景（关心过程中的状态）：
```js
// 1. 滚动加载/懒加载
window.addEventListener('scroll', throttle(() => {
  checkLoadMore();
}, 200));

// 2. 拖拽元素位置更新
element.addEventListener('drag', throttle((e) => {
  updatePosition(e.clientX, e.clientY);
}, 16)); // 约60fps

// 3. 鼠标移动追踪
document.addEventListener('mousemove', throttle((e) => {
  trackMousePosition(e.clientX, e.clientY);
}, 100));

// 4. 游戏中的射击频率限制
shootBtn.addEventListener('click', throttle(() => {
  fireWeapon();
}, 500));
```

## 四、Promise

### async/await

```javascript
// async/await 是 Promise 的语法糖
// async 函数返回 Promise
// await 等待 Promise 完成

// 串行执行
async function processArray(array) {
  for (const item of array) {
    await processItem(item)  // 一个一个处理
  }
}

// 并行执行
async function processArray(array) {
  await Promise.all(array.map(item => processItem(item)))
}
```

### Q2: Promise.all 和 Promise.allSettled 的区别？

```javascript
// Promise.all：任一失败就失败
Promise.all([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).catch(err => console.log(err))  // 'error'

// Promise.allSettled：等待所有完成，返回每个的状态
Promise.allSettled([
  Promise.resolve(1),
  Promise.reject('error'),
  Promise.resolve(3)
]).then(results => console.log(results))
// [
//   { status: 'fulfilled', value: 1 },
//   { status: 'rejected', reason: 'error' },
//   { status: 'fulfilled', value: 3 }
// ]
```

### Q7: 如何让 async 函数并行执行？

```javascript
// 错误：串行
async function wrong() {
  const a = await fetch('/api/a')  // 等待
  const b = await fetch('/api/b')  // 再等待
}

// 正确：并行
async function correct() {
  const [a, b] = await Promise.all([
    fetch('/api/a'),
    fetch('/api/b')
  ])
}
```