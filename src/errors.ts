export class ValidationError extends Error {
  errors: any;

  constructor(message: string, errors: any) {
    super(message);
    this.errors = errors;
  }
}
