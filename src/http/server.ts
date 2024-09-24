import { Elysia } from 'elysia'
import { env } from '../env'
import { registerRestaurant } from './routes/restaurants/register-restaurant'

const app = new Elysia().use(registerRestaurant)

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
