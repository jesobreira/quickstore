const Quickstore = require('../dist').default

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : '',
    password : '',
    database : ''
  }
})

var redis = require('redis').createClient()

var qs = new Quickstore({
	knex: knex,
	redis: redis,
	mysql: {
		tableName: 'storage',
		keyColumn: 'key',
		valueColumn: 'value'
	}
})

// let's test namespaces?
qs = qs.namespace('sample')

console.log("Setting key...")
qs.set('foo', 'bar').then(() => {
	console.log("Retrieving key...")
	qs.get('foo').then(res => {
		console.log(res === 'bar' ? "Key retrieved successfully" : "ERROR: could not retrieve value!")
		console.log("Deleting key")
		qs.del('foo').then(c => {
			qs.get('foo').then(res => {
				console.log(res ? "ERROR: could not delete key" : "Key deleted successfully")
				knex.destroy()
				redis.end(true)
			})
		})
	})
})