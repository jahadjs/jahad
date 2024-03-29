import { defineAppConfig, env } from '@jahadjs/core'

export default defineAppConfig({
    env: env('APP_ENV', 'production'),
    debug: env('APP_DEBUG', 'false') === 'true',
})