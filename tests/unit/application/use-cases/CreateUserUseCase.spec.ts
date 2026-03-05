import { describe, expect, it, vi } from "vitest";
import { CreateUserUseCase } from "../../../../src/application/use-cases/CreateUserUseCase";
import type { UserRepository } from "../../../../src/application/ports/UserRepository";
import type { PasswordHasher } from "../../../../src/application/ports/PasswordHasher";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { BusinessRuleError } from "../../../../src/shared/errors/BusinessRuleError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

function buildSut() {
  const userRepository: UserRepository = {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    save: vi.fn()
  };

  const passwordHasher: PasswordHasher = {
    hash: vi.fn().mockResolvedValue("hashed")
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue("user-123")
  };

  const useCase = new CreateUserUseCase(userRepository, passwordHasher, idGenerator);

  return { useCase, userRepository, passwordHasher };
}

describe("CreateUserUseCase", () => {
  it("should create user with hashed password", async () => {
    const { useCase, userRepository, passwordHasher } = buildSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    const user = await useCase.execute({
      name: "Alice",
      email: "alice@mail.com",
      password: "12345678"
    });

    expect(passwordHasher.hash).toHaveBeenCalledWith("12345678");
    expect(userRepository.save).toHaveBeenCalledOnce();
    expect(user.toJSON().passwordHash).toBe("hashed");
  });

  it("should throw when email already exists", async () => {
    const { useCase, userRepository } = buildSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue({} as never);

    await expect(
      useCase.execute({
        name: "Alice",
        email: "alice@mail.com",
        password: "12345678"
      })
    ).rejects.toThrow(BusinessRuleError);
  });

  it("should validate password length", async () => {
    const { useCase, userRepository } = buildSut();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      useCase.execute({
        name: "Alice",
        email: "alice@mail.com",
        password: "123"
      })
    ).rejects.toThrow(ValidationError);
  });
});
