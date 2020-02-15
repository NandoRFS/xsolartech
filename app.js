const Hapi = require('hapi')
const Mongoose = require('mongoose')
var nodemailer = require('nodemailer')

const server = new Hapi.server({'host': 'localhost', 'port': 8000})

Mongoose.connect("mongodb://localhost/xsolartech", {useNewUrlParser: true});


// For People
const PersonModel = Mongoose.model("person", {
    name: String,
    email: String,
    cpf: String,
    phone: String,
    addresses: [{type: Mongoose.Schema.Types.ObjectId, ref: 'address'}]
});

server.route({
    method: 'POST',
    path: '/person',
    handler: async (request, h) => {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            port: 25,
            auth: {
                user: 'nandersonferdi@gmail.com',
                pass: '0123456@'
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let HelperOptions = {
            from: '"X Solar Tech" <nandersonferdi@gmail.com',
            to: 'nandersonferdi@gmail.com',
            subject: 'Novo Cliente Cadastrado! (não responda)',
            text: `O cliente ${request.payload.name} (${request.payload.cpf}) foi cadastrado! Para mais informações, acesse o sistema :)`
        }

        transporter.sendMail(HelperOptions, (error, info) => {
            if (error)
                return console.log(error)

            console.log("The message was sent!")
            console.log(info)
        })

        try {
            let person = new PersonModel(request.payload)
            let result = await person.save()
            return h.response(result)
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

server.route({
    method: 'GET',
    path: '/people',
    handler: async (request, h) => {
        try {
            let people = await PersonModel.find().
            populate('addresses').exec()
            return h.response(people)
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

server.route({
    method: 'GET',
    path: '/person/{id}',
    handler: async (request, h) => {
        try {
            let person = await PersonModel.findById(request.params.id)
                .populate('addresses').exec()
            return h.response(person)
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

server.route({
    method: 'PUT',
    path: '/person/{id}',
    handler: async (request, h) => {
        try {
            let result = await PersonModel.findByIdAndUpdate(request.params.id, request.payload, {new: true})
            return h.response(result)
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

server.route({
    method: 'DELETE',
    path: '/person/{id}',
    handler: async (request, h) => {
        try {
            let result = await PersonModel.findByIdAndDelete(request.params.id);
            return h.response(result)
        } catch (error) {
            return h.response(error).code(500);
        }
    }
})

// For Address

const AddressModel = Mongoose.model("address", {
    zipcode: String,
    city: String,
    state: String,
    neighborhood: String,
    street: String,
    number: String,
    complement: String,
    type: String,
    mainAddress: Boolean
})

server.route({
    method: 'POST',
    path: '/address',
    handler: async (request, h) => {
        try {
            let resp = new AddressModel(request.payload)
            let result = await resp.save()
            return h.response(result)
        } catch(error) {
            return h.response(error).code(500)
        }
    }
})

server.route({
    method: 'GET',
    path: '/addresses',
    handler: async (request, h) => {
        try {
            let resp = await AddressModel.find().exec()
            return h.response(resp)
        } catch(error) {
            return h.response.error(error).code(500)
        }
    }
})

server.route({
    method: 'GET',
    path: '/address/{id}',
    handler: async (request, h) => {
        try {
            let resp = await AddressModel.findById(request.params.id).exec()
            return h.response(resp)
        } catch(error) {
            return h.response.error(error).code(500)
        }
    }
})

server.route({
    method: 'PUT',
    path: '/address/{id}',
    handler: async (request, h) => {
        try {
            let resp = await AddressModel.findByIdAndUpdate(request.params.id, request.payload, {new: true})
            return h.response(resp)
        } catch(error) {
            return h.response().error(error).code(500)
        }
    }
})

server.route({
    method: 'DELETE',
    path: '/address/{id}',
    handler: async (request, h) => {
        try {
            let resp = await AddressModel.findByIdAndDelete(request.params.id)
            return h.response(resp)
        } catch(error) {
            return h.response().error(error).code(500)
        }
    }
})
const start = async function() {
    try {
        await server.register({
            plugin: require('hapi-cors'),
            options: {
                origins: ['http://localhost:3000'],
                methods: ['DELETE', 'PUT']
                }
        })

        await server.start()
    } catch(err) {
        console.log(err)
        process.exit(1)
    }
}

start()
