---
title: "搜索高亮怎么弄"
description: ""
pubDate: "Sep 15 2024"
categories: ["前端"]
---

> 假设现在有一颗树，要求搜索关键字，节点中匹配到的关键字要能高亮，要怎么做？我先想到的是关键字包裹标签的方式，后来查了一下还有几种高亮的方式，本文讨论了几种实现高亮的方式。

## 包裹标签
直接上代码,页面上有一个简化的内容区域，和一个搜索框，点击搜索按钮，匹配到的内容会显示成黄色。

```
// HTML
<div class="editor">11112211122222333</div>
  <input type="search" />
<button>Search</button>

// JS
document.querySelector('button').addEventListener('click', function() {
  const searchValue = document.querySelector('input').value
  const regExp = new RegExp(searchValue, 'g')
  const editor = document.querySelector('.editor')
  const textValue = editor.innerHTML.replace(
    regExp, 
    `<span style="background: yellow;">${searchValue}</span>`
  )
  editor.innerHTML = textValue
})
```
## Range 选区贴标签
```
let highlight = []
document.querySelector('button').addEventListener('click', function () {
  const searchValue = document.querySelector('input').value
  const len = searchValue.length
  const regExp = new RegExp(searchValue, 'g')
  const editor = document.querySelector('.editor')
  const textNode = editor.childNodes[0]
  let result = null

  while (result = regExp.exec(textNode.data)) {
    const { index } = result
    const range = document.createRange()
    range.setStart(textNode, index)
    range.setEnd(textNode, index + len)
    const rangeReact = range.getBoundingClientRect()
    highlight.push(rangeReact)
  }

  console.log(highlight);
})
```
通过对搜索关键字创建正则 `new RegExp(searchValue, 'g')`, 执行正则 `regExp.exec(textNode.data)`, 开启一个 while 循环， 得到匹配到的一个个起始索引 `index`, 进而计算出一个个结束索引 `index + len`, 创建 Range 对象，设置 range 的 start 和 end，再 push 到一个 list 中，最终得到的 list 数据格式的样子如下面代码，包含了一个个 range 的位置信息，然后将 list 作为遮罩渲染出来即可。
```
[
    {
        "x": 34.65625,
        "y": 9,
        "width": 9.609375,
        "height": 22.5,
        "top": 9,
        "right": 44.265625,
        "bottom": 31.5,
        "left": 34.65625
    },
    {
        "x": 44.2578125,
        "y": 9,
        "width": 9.609375,
        "height": 22.5,
        "top": 9,
        "right": 53.8671875,
        "bottom": 31.5,
        "left": 44.2578125
    },
    ...
]
```

## CSS Hignlight API
关于高亮的做法，其实还有一种是 CSS 高亮API的方式，css高亮api提供了一种机制，可以使用 js 创建选取，并让 css 设置样式。设置样式分为四个步骤
- 创建 Range 选区
- 使用 Hignlight 接口为这些 ranges 创建高亮对象
- 使用 CSS.highlights 进行高亮注册
- 使用 ::highlight 伪元素设置样式

### 创建 range 选区
具体像文字内容搜索高亮的场景来说，如何创建 range 选区？可以使用 `document.createTreeWalker` 创建一个 [TreeWalker](https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker), TreeWalker 是什么？TreeWalker 对象表示创建的节点的子节点以及位置信息。可以使用 treeWalker.nextNode() 表示第一个子节点，节点之间通过 nextNode 相连，类似链表的 next 方法，可以进行迭代。对每一个节点进行处理，得到索引数组，再构造 ranges 数组。

### 使用 Hignlight 接口为这些 ranges 创建高亮对象
```
const searchResultsHighlight = new Highlight(...ranges.flat());
```

### 使用 CSS.highlights 进行高亮注册
```
CSS.highlights.set("search-results", searchResultsHighlight);
```

### 使用 ::highlight 伪元素设置样式
```
::highlight(search-results) {
  background-color: #f06;
  color: white;
}
```

完整代码如下
```
// https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API

const query = document.querySelector("input");
const article = document.querySelector(".editor");

// Find all text nodes in the article. We'll search within
// these text nodes.
const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
const allTextNodes = [];
let currentNode = treeWalker.nextNode();
while (currentNode) {
  allTextNodes.push(currentNode);
  currentNode = treeWalker.nextNode();
}

// Listen to the input event to run the search.
query.addEventListener("input", () => {
  // If the CSS Custom Highlight API is not supported,
  // display a message and bail-out.
  if (!CSS.highlights) {
    article.textContent = "CSS Custom Highlight API not supported.";
    return;
  }

  // Clear the HighlightRegistry to remove the
  // previous search results.
  CSS.highlights.clear();

  // Clean-up the search query and bail-out if
  // if it's empty.
  const str = query.value.trim().toLowerCase();
  if (!str) {
    return;
  }

  // Iterate over all text nodes and find matches.
  const ranges = allTextNodes
    .map((el) => {
      return { el, text: el.textContent.toLowerCase() };
    })
    .map(({ text, el }) => {
      const indices = [];
      let startPos = 0;
      while (startPos < text.length) {
        const index = text.indexOf(str, startPos);
        if (index === -1) break;
        indices.push(index);
        startPos = index + str.length;
      }

      // Create a range object for each instance of
      // str we found in the text node.
      return indices.map((index) => {
        const range = new Range();
        range.setStart(el, index);
        range.setEnd(el, index + str.length);
        return range;
      });
    });

  // Create a Highlight object for the ranges.
  const searchResultsHighlight = new Highlight(...ranges.flat());

  // Register the Highlight object in the registry.
  CSS.highlights.set("search-results", searchResultsHighlight);
});

```

## 小结
包裹标签是最朴素的做法，是最容易想到，但往往没啥应用。贴标签是比较巧妙的做法，但渲染标签会有很多定位相关的问题，比较复杂，bug也多。CSS 高亮api 的做法目前看应该是最佳实践，因为容易理解，功能强大。





