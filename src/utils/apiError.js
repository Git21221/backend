class apiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    //things to override
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.stack = stack;
    this.message = message;
    this.success = false;
    this.data = null;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { apiError };
