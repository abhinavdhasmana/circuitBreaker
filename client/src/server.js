const Hapi = require('hapi');
const Good = require('good');
const Boom = require('boom');
const CircuitBreaker = require('./circuitBreaker');

const options = {
  reporters: {
    myConsoleReporter: [
      {
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{ log: '*', response: '*' }],
      }, {
        module: 'good-console',
      }, 'stdout',
    ],
  },
};

const server = Hapi.server({
  host: '0.0.0.0',
  port: 8001,
});

let numberOfRequest = 0;

server.route({
  method: 'GET',
  path: '/data2',
  handler: (request, h) => {
    try {
      return h.response('data2');
    } catch (err) {
      throw Boom.clientTimeout(err);
    }
  },
});

const circuitBreaker = new CircuitBreaker(3000, 5, 2000);


server.route({
  method: 'GET',
  path: '/data',
  handler: async (request, h) => {
    numberOfRequest += 1;
    try {
      console.log('numberOfRequest received on client:', numberOfRequest);
      const response = await circuitBreaker.call('http://0.0.0.0:8000/flakycall');
      // console.log('response is ', response.data);
      return h.response(response.data);
    } catch (err) {
      throw Boom.clientTimeout(err);
    }
  },
});


const start = async () => {
  try {
    await server.register({
      plugin: Good,
      options,
    });
    await server.start();
    console.log('server started');
  } catch (err) {
    console.log('unable to start the server', err);
  }
};

start();
