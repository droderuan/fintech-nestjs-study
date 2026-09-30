import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/createAccount.dto';
import { AccountResponseDto } from './dto/accountResponse.dto';

@ApiTags('accounts')
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Create an account' })
  @ApiCreatedResponse({ type: AccountResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid payload' })
  @ApiConflictResponse({
    description: 'An account with this document already exists',
  })
  async create(@Body() dto: CreateAccountDto): Promise<AccountResponseDto> {
    const account = await this.accountsService.create(dto);
    return AccountResponseDto.fromEntity(account, 0);
  }

  @Get(':accountId')
  @ApiOperation({ summary: 'Get an account with its available amount' })
  @ApiOkResponse({ type: AccountResponseDto })
  @ApiBadRequestResponse({ description: 'accountId is not a UUID' })
  @ApiNotFoundResponse({ description: 'Account not found' })
  async findOne(
    @Param('accountId', ParseUUIDPipe) accountId: string,
  ): Promise<AccountResponseDto> {
    const { account, amount } = await this.accountsService.findById(accountId);
    return AccountResponseDto.fromEntity(account, amount);
  }
}
