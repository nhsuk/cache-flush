function buildResponse(body, status) {
  return {
    body,
    headers: { 'Content-Type': 'application/json' },
    status,
  };
}

module.exports = {
  buildResponse,
};
