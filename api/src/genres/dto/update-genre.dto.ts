import { PartialType } from '@nestjs/mapped-types';
import { CreateGenreDto } from './create-genre.dto';

// Same rules as CreateGenreDto, but every field is optional
export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
