---
title: "搜索高亮怎么弄"
description: ""
pubDate: "Sep 15 2024"
categories: ["前端"]
---

> 假设现在有一颗树，要求搜索关键字，节点中匹配到的关键字要求高亮，要怎么做？我先想到的是关键字包裹标签的方式，后来查了一下还有几张高亮的方式，本文讨论了两种实现高亮的方式。

## 包裹标签
直接上代码,页面上有一个简化的内容区域，和一个搜索框，点击搜索按钮，匹配到的内容高亮。

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
通过创建 Range 对象，执行正则 `regExp.exec(textNode.data)`, 得到匹配到的一个个起始索引 `index`, 进而计算出一个个结束索引 `index + len`, 最终得到 Range 对象，如下面数据格式的样子，包含了一个个的位置信息，然后将其作为遮罩渲染出来即可。
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
关于高亮的做法，其实还有一种是 CSS 高亮API的方式，先知道这回事吧，有空再学习，知识需要应用，进而得到理解
（未完）

