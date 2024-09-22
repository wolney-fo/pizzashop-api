import { Elysia } from 'elysia'
import { env } from '../env'

const app = new Elysia()

app.get('/', () => {
	return 'Hello World'
})

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
