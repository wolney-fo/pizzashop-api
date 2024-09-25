import { Elysia, t } from 'elysia'
import { env } from '../env'
import { sendAuthLink } from './routes/auth-links/send-auth-link'
import { registerRestaurant } from './routes/restaurants/register-restaurant'
import jwt from '@elysiajs/jwt'
import cookie from '@elysiajs/cookie'

const app = new Elysia()
	.use(
		jwt({
			secret: env.JWT_SECRET_KEY,
			schema: t.Object({
				sub: t.String(),
				restaurantId: t.Optional(t.String()),
			}),
		})
	)
	.use(cookie())
	.use(registerRestaurant)
	.use(sendAuthLink)

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
