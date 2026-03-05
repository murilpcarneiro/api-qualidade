import { Email } from "../value-objects/Email";
import { ValidationError } from "../../shared/errors/ValidationError";

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  public static create(props: UserProps): User {
    if (!props.id.trim()) {
      throw new ValidationError("User id is required");
    }

    if (!props.name.trim()) {
      throw new ValidationError("User name is required");
    }

    const email = Email.create(props.email);

    if (!props.passwordHash.trim()) {
      throw new ValidationError("Password hash is required");
    }

    return new User({ ...props, email: email.getValue() });
  }

  public toJSON(): UserProps {
    return { ...this.props };
  }

  public get id(): string {
    return this.props.id;
  }

  public get email(): string {
    return this.props.email;
  }
}
