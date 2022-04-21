import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

const makeSut = () => {
  const statementsRepository = new InMemoryStatementsRepository()
  const usersRepository = new InMemoryUsersRepository()

  const sut = new CreateStatementUseCase(usersRepository, statementsRepository)

  return {
    sut,
    usersRepository,
    statementsRepository
  }
}

describe('Create Statement Usecase', () => {
  it('should not be able to create a statement to inexistent user', async () => {
    const { sut } = makeSut()


    const response = sut.execute({
      user_id: 'non-existing-user',
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'any_description'
    })

    await expect(response).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('should not be able to create a statement if user balance is insufficient', async () => {
    const { sut, usersRepository, statementsRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = sut.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 100,
      description: 'any_description'
    })

    await expect(response).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });

  it('should be able to create a statement with operation deposit', async () => {
    const { sut, usersRepository, statementsRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = await sut.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: 'any_description'
    })

    expect(response).toEqual(expect.objectContaining({
      id: expect.any(String),
      user_id: user.id,
      type: OperationType.DEPOSIT,
      amount: 50,
      description: 'any_description'
    }))
  });


  it('should be able to create a statement with operation withdraw', async () => {
    const { sut, usersRepository, statementsRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    await statementsRepository.create({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 100,
      description: 'any_description'
    })

    const response = await sut.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'any_description'
    })

    expect(response).toEqual(expect.objectContaining({
      id: expect.any(String),
      user_id: user.id,
      type: OperationType.WITHDRAW,
      amount: 50,
      description: 'any_description'
    }))
  });
});
