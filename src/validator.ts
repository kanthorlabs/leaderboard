import Ajv from "ajv";
import withFormats from "ajv-formats";

export default withFormats(new Ajv());

export class ValidationError extends Error {
  errors: any;

  constructor(message: string, errors: any) {
    super(message);
    this.errors = errors;
  }
}
