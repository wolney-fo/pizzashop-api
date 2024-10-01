import { Elysia } from 'elysia'
import { env } from '../env'
import { authenticateFromLink } from './routes/auth-links/authenticate-from-link'
import { sendAuthLink } from './routes/auth-links/send-auth-link'
import { signOut } from './routes/auth-links/sign-out'
import { getOrderDetails } from './routes/orders/get-order-details'
import { registerRestaurant } from './routes/restaurants/register-restaurant'
import { getManagedRestaurant } from './routes/users/get-managed-restaurant'
import { getProfile } from './routes/users/get-profile'

const app = new Elysia()
	.use(registerRestaurant)
	.use(sendAuthLink)
	.use(authenticateFromLink)
	.use(signOut)
	.use(getOrderDetails)
	.use(getProfile)
	.use(getManagedRestaurant)
	.onError(({ error, code, set }) => {
		switch (code) {
			case 'VALIDATION':
				set.status = error.status

				return error.toResponse()
			default: {
				console.error(error)

				return new Response(null, { status: 500 })
			}
		}
	})

app.listen(env.PORT, () => {
	console.log('HTTP Server running.')
})
