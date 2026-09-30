import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/createAccount.dto';
import { AccountResponseDto } from './dto/accountResponse.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountsService.create(dto);
    return AccountResponseDto.fromEntity(account);
  }

  @Get(':accountId')
  async findOne(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<AccountResponseDto> {
    const account = await this.accountsService.findById(accountId);
    return AccountResponseDto.fromEntity(account);
  }
}
