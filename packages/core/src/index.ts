import Fastify from "fastify"

const fastify = Fastify()

fastify.get("/", async (request, reply) => {
    return { hello: "world" }
})

fastify.listen({ port: 3000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})