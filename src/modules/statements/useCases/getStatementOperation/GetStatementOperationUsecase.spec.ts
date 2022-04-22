import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

const makeSut = () => {
  const statementsRepository = new InMemoryStatementsRepository()
  const usersRepository = new InMemoryUsersRepository()

  const sut = new GetStatementOperationUseCase(usersRepository, statementsRepository)

  return {
    sut,
    usersRepository,
    statementsRepository
  }
}

describe('Get Statement Operation Usecase', () => {
  it('should not be able to get statement operation to inexistent user', async () => {
    const { sut } = makeSut()

    const response = sut.execute({
      user_id: 'non-existing-user',
      statement_id: 'any_statement_id'
    })

    await expect(response).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  });


  it('should not be able to get statement operation if not exists', async () => {
    const { sut, usersRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = sut.execute({
      user_id: user.id as string,
      statement_id: 'any_statement_id'
    })

    await expect(response).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });

  it('should be able to get statement operation', async () => {
    const { sut, usersRepository, statementsRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const statement = await statementsRepository.create({
      user_id: user.id as string,
      description: 'any_description',
      type: OperationType.DEPOSIT,
      amount: 100
    })

    const response = await sut.execute({
      user_id: user.id as string,
      statement_id: statement.id as string
    })

    expect(response).toEqual(expect.objectContaining({
      id: statement.id,
      user_id: statement.user_id,
      description: statement.description,
      type: statement.type,
      amount: statement.amount,
    }))
  });
});
