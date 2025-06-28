import { Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GeographySeederService } from './geography.seeder.service';

@Controller('seeder')
export class SeederController {
  constructor(
    private readonly geographySeederService: GeographySeederService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  @Post('seederGeography')
  async seederGeography() {
    return this.geographySeederService.seed();
  }
}
