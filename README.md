# fndt
JavaScript package allowing you to see function data like body and arguments from outside of the function<br>
it uses try catches to correct mistakes dynamically and bunch all of them into one simple class

- lightweight
- easy to use
- open source

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


console.log(fndt.fetch(test));
```

</td>

<td>

```js
FunctionData {
    name: "test",
    dataName: "test",
    body: "console.log(a, b);",
    arguments: { a: null, b: "placeholder" },
    data: Function,
    string: "function test(a, b="placeholder") {
        console.log(a, b);
    }"
}
```
  
</td>

</tr>
</table>
