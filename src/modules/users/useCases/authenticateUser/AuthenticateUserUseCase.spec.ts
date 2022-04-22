import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";
import authConfig from '../../../../config/auth';

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository()
  const sut = new AuthenticateUserUseCase(usersRepository)
  return {
    sut,
    usersRepository
  }
}


describe('Authenticate User Usecase', () => {
  it('should not be able to authenticate a user if not exists', async () => {
    const { sut } = makeSut()

    const response = sut.execute({
      email: 'any_email',
      password: 'any_password'
    })

    await expect(response).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it('should not be able to authenticate a user if password is incorrect', async () => {
    const { sut, usersRepository } = makeSut()
    await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = sut.execute({
      email: 'any_email',
      password: 'incorrect_password'
    })

    await expect(response).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  });

  it('should be able to authenticate a user', async () => {
    const { sut, usersRepository } = makeSut()

    authConfig.jwt.secret = 'any_secret'

    await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: await hash('any_password', 10)
    })

    const response = await sut.execute({
      email: 'any_email',
      password: 'any_password',
    })

    expect(response).toEqual(expect.objectContaining({
      user: expect.objectContaining({
        id: expect.any(String),
        name: 'any_name',
        email: 'any_email'
      }),
      token: expect.any(String)
    }))
  });
})
