# Quickstore

Node asynchronous namespaced key-value persistent storage which uses Knex and caches using Redis.

## Install

```
npm i quickstore
```

You have to provide a Knex and a Redis instance. Examples:

```
// your knex instance, e.g.
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : '',
    password : '',
    database : ''
  }
})

// your redis instance, e.g.
var redis = require('redis').createClient()
```

Create a quickstore instance:

```
import Quickstore from 'quickstore' // or const Quickstore = require('../dist').default

var qs = new Quickstore({
	knex: knex,
	redis: redis,
	mysql: {
		tableName: 'storage',
		keyColumn: 'key',
		valueColumn: 'value'
	}
})
```

## Usage

You can **set** and retrieve keys on the primary namespace:

```
qs.set('foo', 'bar')
```

(Note: the above returns a promise that throws in case of error)

To **retrieve** the value, simply do:

```
console.log(await qs.get('foo')) // => "bar"
```

Or

```
qs.get('foo').then(val => {
	console.log(val) // => "bar"
})
```

To **delete** the value:

```
qs.del('foo')
```

You can store values in different **namespaces**:

```
let new_namespace = qs.namespace('another_namespace')

// the API is still the same
new_namespace.set('foo', 'bar')
```

And store any primitive **datatype**:

```
await qs.set('myNumber', 123)
typeof (await qs.get('myNumber')) // "number"
```

```
await qs.set('myObj', { greeting: 'hey' })
(await qs.get('myObj')).greeeting // "hey"
```
