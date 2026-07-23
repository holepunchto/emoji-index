# emoji-index

Tiny embedded emoji index

```
npm install emoji-index
```

Is just ~75kb in size and consumes only ~60kb on memory when running.

## Usage

```js
const e = require('emoji-index')

console.log(e.toEmoji('neutral')) // prints 😐
console.log(e.toShortCode('😐')) // prints neutral
```

## License

Apache 2.0
