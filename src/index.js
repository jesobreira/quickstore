'use strict'

class Quickstore {
	constructor({ knex, redis, mysql, namespace = false, prefix = 'qstore' }) {
		this.knex = knex
		this.redis = redis
		this.prefix = prefix
		this.currentNamespace = namespace ? prefix+':'+namespace : prefix
		this.mysql = {
			tableName: mysql.tableName,
			keyColumn: mysql.keyColumn || 'key',
			valueColumn: mysql.valueColumn || 'value'
		}
	}

	namespace(switchToNamespace) {
		return new Quickstore({
			knex: this.knex, 
			redis: this.redis,
			prefix: this.prefix,
			namespace: String(this.currentNamespace + ':' + switchToNamespace).substr(this.prefix.length + 1),
			mysql: this.mysql
		})
	}

	get(key) {
		return new Promise((resolve, reject) => {
			this.redis.get(this.currentNamespace+':'+key, (err, res) => {
				if (res) {
					try {
						res = JSON.parse(res)
					} catch (e) {}
					resolve(res)
				} else {
					this.knex.select('*').from(this.mysql.tableName).where(this.mysql.keyColumn, this.currentNamespace+':'+key).then(rows => {
						if (rows.length) {
							this.redis.set(this.currentNamespace+':'+key, rows[0][this.mysql.valueColumn])
							resolve(rows[0][this.mysql.valueColumn])
						}
						else
							resolve(false)
					}).catch(reject)
				}
			})
		})
	}

	set(key, value) {
		return new Promise((resolve, reject) => {
			this.redis.set(this.currentNamespace+':'+key, JSON.stringify(value))
			this.knex(this.mysql.tableName).where(this.mysql.keyColumn, this.currentNamespace+':'+key).update({ value: JSON.stringify(value) }, 'id').then(returning => {
				if (!returning.length) {
					// no row was updated
					this.knex(this.mysql.tableName).insert({
						[this.mysql.keyColumn]: this.currentNamespace+':'+key,
						[this.mysql.valueColumn]: JSON.stringify(value)
					}).then(resolve).catch(reject)
				}
			}).catch(reject)
		})
	}

	del(key) {
		return new Promise((resolve, reject) => {
			this.redis.del(this.currentNamespace+':'+key)
			this.knex(this.mysql.tableName).where(this.mysql.keyColumn, this.currentNamespace+':'+key).del().then(resolve).catch(reject)
		})
	}
}

export default Quickstore