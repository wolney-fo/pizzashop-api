import { Elysia } from 'elysia'
import { env } from '../env'
import { authenticateFromLink } from './routes/auth-links/authenticate-from-link'
import { sendAuthLink } from './routes/auth-links/send-auth-link'
import { registerRestaurant } from './routes/restaurants/register-restaurant'

const app = new Elysia()
	.use(registerRestaurant)
	.use(sendAuthLink)
	.use(authenticateFromLink)

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
