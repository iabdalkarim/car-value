import { Expose } from 'class-transformer';

export class GetAllUsersDto {
  @Expose()
  email: string;
}
