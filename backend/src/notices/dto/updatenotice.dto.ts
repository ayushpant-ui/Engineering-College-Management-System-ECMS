import { NOTICE_CATEGORIES } from "../noticecategory";
import type { NoticeCategory } from "../noticecategory";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";

// Same rules as CreateNoticeDto, but every field is optional (PATCH).
export class UpdateNoticeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  body?: string;

  @IsOptional()
  @IsIn(NOTICE_CATEGORIES)
  category?: NoticeCategory;

  @ValidateIf((o) => o.attachmentUrl !== undefined && o.attachmentUrl !== "")
  @IsString()
  @MaxLength(500)
  @Matches(/^(https?:\/\/|\/)/, {
    message: "attachmentUrl must start with http://, https:// or /",
  })
  attachmentUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}