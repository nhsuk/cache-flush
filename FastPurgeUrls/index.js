module.exports = async function index() {
  return {
    body: 'This environment is open, and has access to your secrets.',
    status: 200,
  };
};
