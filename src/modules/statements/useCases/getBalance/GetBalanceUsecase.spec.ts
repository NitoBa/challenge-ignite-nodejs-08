import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

const makeSut = () => {
  const statementsRepository = new InMemoryStatementsRepository()
  const usersRepository = new InMemoryUsersRepository()

  const sut = new GetBalanceUseCase(statementsRepository, usersRepository)

  return {
    sut,
    usersRepository,
    statementsRepository
  }
}

describe('Create Statement Usecase', () => {
  it('should not be able to get balance to inexistent user', async () => {
    const { sut } = makeSut()


    const response = sut.execute({
      user_id: 'non-existing-user',
    })

    await expect(response).rejects.toBeInstanceOf(GetBalanceError)
  });

  it('should be able to get balance of the user', async () => {
    const { sut, usersRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = await sut.execute({
      user_id: user.id as string,
    })

    expect(response.balance).toBe(0)
    expect(response.statement.length).toBe(0)
  });
});
