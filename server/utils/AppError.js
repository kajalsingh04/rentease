// Use this to throw errors with a status code.
// Example: throw new AppError('Product not found', 404);
export default class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}