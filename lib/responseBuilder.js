function buildResponseAndLog(body, status, log) {
  log(body);
  return {
    body,
    headers: { 'Content-Type': 'application/json' },
    status,
  };
}

module.exports = {
  buildResponseAndLog,
};
