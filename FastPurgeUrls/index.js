module.exports = function index(context, req) {
  return {
    body: 'This environment is open, and has access to your secrets.',
    status: 200,
  },
};
