const Hapi = require('hapi');
const Good = require('good');


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
  port: 8000,
});

let numberOfRequest = 0;
const serverStartTime = Date.now();

server.route({
  method: 'GET',
  path: '/flakycall',
  handler: async (request, h) => {
    numberOfRequest += 1;
    const currentTime = Date.now();
    if ((currentTime - serverStartTime) < (1000 * 60 * 5)) {
      console.log('numberOfRequest received on server:', numberOfRequest);
      const result = await new Promise((resolve) => {
        setTimeout(() => {
          resolve('This is a delayed repsonse');
        }, 5000);
      });
      return h.response(result);
    }
    return h.response('This is immediate response');
  },
});

const start = async () => {
  try {
    if (!module.parent) {
      await server.register({
        plugin: Good,
        options,
      });
      await server.start();
    }
    console.log('server started');
  } catch (err) {
    console.log('failed to start the server', err);
  }
};

start();
