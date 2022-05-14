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

## Navigation

- <kbd>H</kbd> - Next heading
- <kbd>L</kbd> - Next link
- <kbd>M</kbd> - Next landmark
- <kbd>↑</kbd> - Change next direction toward Top and Left
- <kbd>↓</kbd> - Change next direction toward Bottom and Right




## Including and Excluding
Right before the script tag for index.js add
```html
<script>
    window.UniversalKeyboardNavigatorOptions = { 
        // Include for Landmark elements
        landmarkSelectors: ['header', 'footer'], 

        // Exclude
        excludeSelectors: ['header', 'footer'] 
    }
</script>
```


