# fndt
JavaScript package allowing you to see function data like body and arguments from outside of the function<br>
it uses try catches to correct mistakes dynamically and bunch all of them into one simple class

- easy to use
- open source
- advanced scoping
- argument fetching

<br>

```console
npm i fndt
```
```console
npm i paishee/fndt
```

<br>

<table>
<tr>
<td>JS</td><td>Output</td>
</tr>
<tr>
<td>
  
```js
const fndt = require('fndt');


function test(a, b="placeholder") {       
    console.log(a, b);
}


fndt.fetch(test, (data) => {
    console.log(data);
});
```

</td>

<td>

```js
FunctionData {
    pending: false,
    name: "test",
    dataName: "test",
    body: "console.log(a, b);",
    arguments: { a: null, b: "placeholder" },
    isAsync: false,
    isArrow: false,
    data: Function,
    string: "function test(a, b="placeholder") {
        console.log(a, b);
    }"
}
```
  
</td>

</tr>
</table>
