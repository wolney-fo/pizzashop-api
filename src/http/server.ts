import { Elysia } from 'elysia'
import { env } from '../env'
import { sendAuthLink } from './routes/auth-links/send-auth-link'
import { registerRestaurant } from './routes/restaurants/register-restaurant'

const app = new Elysia().use(registerRestaurant).use(sendAuthLink)

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
