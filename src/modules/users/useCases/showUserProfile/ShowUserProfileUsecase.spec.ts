import { hash } from "bcryptjs";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import authConfig from '../../../../config/auth';
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { User } from "../../entities/User";
import { ShowUserProfileError } from "./ShowUserProfileError";

const makeSut = () => {
  const usersRepository = new InMemoryUsersRepository()
  const sut = new ShowUserProfileUseCase(usersRepository)
  return {
    sut,
    usersRepository
  }
}


describe('CreateUserUsecase', () => {
  it('should not be able to get user infos if not exists', async () => {
    const { sut } = makeSut()

    const response = sut.execute('non-existing-user')

    await expect(response).rejects.toBeInstanceOf(ShowUserProfileError)
  });

  it('should be able to get user infos to show profile', async () => {
    const { sut, usersRepository } = makeSut()

    const user = await usersRepository.create({
      name: 'any_name',
      email: 'any_email',
      password: 'any_password'
    })

    const response = await sut.execute(user.id as string)

    expect(response).toEqual(expect.objectContaining({
      id: user.id,
      name: user.name,
      email: user.email,
    }))
  });
})
