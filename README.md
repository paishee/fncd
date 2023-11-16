# fncdt
JavaScript package allowing you to see function data like body and arguments from outside of the function

- lightweight
- easy to use
- open source

<table>
<tr>
<td>JS</td><td>Output</td>
</tr>
<tr>
<td>
  
```js
const fncdt = require('fncdt');


function test(a, b="placeholder") {        
    console.log(a, b);
}


console.log(fncdt.fetch(test));
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
