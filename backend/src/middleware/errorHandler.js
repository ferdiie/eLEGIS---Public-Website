// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(`[error] ${req.method} ${req.originalUrl}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? "Something went wrong. Please try again later." : err.message,
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}
