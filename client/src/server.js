const Hapi = require('hapi');
const Good = require('good');
const axios = require('axios');
const Boom = require('boom');

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

server.route({
  method: 'GET',
  path: '/data',
  handler: async (request, h) => {
    try {
      const response = await axios({
        url: 'http://0.0.0.0:8000/flakycall',
        timeout: 6000,
        method: 'get',

      });
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
