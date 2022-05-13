```shell
npm run dev
```

then add to a page via console

```js
let script = document.createElement('script');
script.src = 'http://localhost:8080/index.js'; 
document.body.appendChild(script); 
```
OR open http://localhost:8080/examples for example pages