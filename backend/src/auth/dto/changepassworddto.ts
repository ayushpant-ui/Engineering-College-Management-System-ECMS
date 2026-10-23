import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @MinLength(12, {
    message: 'New password must be at least 12 characters long.',
  })
  @MaxLength(128, {
    message: 'New password must not exceed 128 characters.',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'New password must contain an uppercase letter, a lowercase letter, a number, and a special character.',
  })
  newPassword!: string;
}