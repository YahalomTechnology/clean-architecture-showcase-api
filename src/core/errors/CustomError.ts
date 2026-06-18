export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
}

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class UnauthorizedError extends CustomError {
  statusCode = 401;

  constructor(public message = 'Not authorized') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class ForbiddenError extends CustomError {
  statusCode = 403;

  constructor(public message = 'Forbidden access') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class NotFoundError extends CustomError {
  statusCode = 404;

  constructor(public message = 'Resource not found') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

export class InternalServerError extends CustomError {
  statusCode = 500;

  constructor(public message = 'Internal server error') {
    super(message);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
