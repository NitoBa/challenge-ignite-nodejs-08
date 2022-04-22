import { User } from "../../entities/User";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository()
  const sut = new CreateUserUseCase(usersRepository)
  return {
    sut,
    usersRepository
  }
}


describe('Create User Usecase', () => {
  it('should not be able to create a user if already exists', async () => {
    const { sut, usersRepository } = makeSut()
    await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = sut.execute({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    await expect(response).rejects.toBeInstanceOf(CreateUserError)
  });
  it('should be able to create a user', async () => {
    const { sut } = makeSut()

    const response = await sut.execute({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    expect(response).toBeInstanceOf(User)
    expect(response).toHaveProperty('id')
  });
})
