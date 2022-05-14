```shell
npm run dev
```

then add to a page via console

```js
// With options: window.UniversalKeyboardNavigatorOptions = { landmarkSelectors: [] }
let script = document.createElement('script');
script.src = 'http://localhost:8080/index.js'; 
document.body.appendChild(script); 
```
OR open http://localhost:8080/examples for example pages

# Keys guide

- <kbd>H</kbd> - Next heading
- <kbd>L</kbd> - Next link
- <kbd>M</kbd> - Next landmark
- <kbd>↑</kbd> - Change next direction toward Top and Left
- <kbd>↓</kbd> - Change next direction toward Bottom and Right




## Including by selector
Right before the script tag to 
```html
<script>
    window.UniversalKeyboardNavigatorOptions = { 
        landmarkSelectors: ['header', 'footer'] 
    }
</script>
```