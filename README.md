# Bookmark.js

It is difficult to navigate on long pages with many sections. Bookmark.js creates anchors to every section and adds them to menu. It is suitable for every design. Scroll the page down to see how it works.

Anchors in menu show order and length of sections. Scrollbar shows where user is reading. Because of that active link is "off" by default. If you want to pick out current section rewrite styles for anchors with `active` class.

Bookmark.js automatically gets titles for anchors, if doesnt find it in `name` attribute. To hash-navigate be usable it adds title or `data-hash` to location. You can disable the change of address bar by change `data-hasChange`.


## First

Add links to scripts and styles in `<head>` of the document:

```html
<head>
  <link href="path/to/bookmark.min.css" rel="stylesheet" />
  <script src="path/to/jquery.js"></script>
  <script src="path/to/bookmark.min.js"></script>
</head>
```

Add class bookmarks to block contains bookmarks:		      

```html
<div class="bookmarks">
  <div class="bookmark" name="First bookmark" data-hash="first"></div>
  <div class="bookmark" name="Second bookmark" data-hash="second"></div>
</div>
```
		
Or pick bookmarks by class `bookmark` and start script like usually jQuery plugin:			

```html
<div class="foo">
  <h1 class="bookmark" name="First bookmark" data-hash="first">Заголовок</h1>
</div>
<script type="text/javascript">
  $(function(){
    $('.foo').bookmark();
  });
</script>
```

## Settings

Parameters are data-attributes of bookmarks-contain block. Or it can be an argument of constructor function.

`autoHide` `boolean`, true — automatically hide menu;

`autoHideTime` `number`, 800 ms — after this time menu will hide;

`fadeTime` `number`,  400 ms — time of fade out;

`scrollingTime` `number`, 500 ms — time of scroll from one section to another;

`bookmarkClassName` `string`, 'bookmar' — class of bookmarks;

`touchDevices` `boolean`, false — how it works on touch devices. autoHide doesnt work;

`onScrollStart` `function` — before scroll to another section;

`onScrollEnd` `function` — right after scroll to another section.

`onScrollStart` and `onScrollEnd` can be managed only by manually initialization.

## Example

```html
<head>
  <link href="path/to/bookmark.min.css" rel="stylesheet" />
  <script src="path/to/jquery.js"></script>
  <script src="path/to/bookmark.min.js"></script>
</head>
<body>
  <div class="foo" data-touchDevices="false" data-hashChange="false" >
    <h1 class="bookmark" name="First bookmark" data-hash="first">Title</h1>
  </div>	
  <script type="text/javascript">
    $(function(){
      $('.foo').bookmark({
        autoHide: true,
        autoHideTime: 900,
        fadeTime: 400,
        scrollingTime: 500,
        bookmarkClassName: 'bookmark',
        onScrollStart: function(curIndex, nextIndex) {},
        onScrollEnd: function(curIndex, nextIndex) {}
        // curIndex — index of current seciotn
        // nextIndex — index of next section
      });
    });
  </script>
</body>
```