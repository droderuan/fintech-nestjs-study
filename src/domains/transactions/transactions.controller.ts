import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/createTransaction.dto';
import { DischargeResponseDto } from './dto/dischargeResponse.dto';
import { DischargeTransactionDto } from './dto/dischargeTransaction.dto';
import { TransactionResponseDto } from './dto/transactionResponse.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a transaction',
    description:
      'Debit types (purchase, purchase_with_installments, withdraw) are stored with a negative amount and require enough funds.',
  })
  @ApiCreatedResponse({ type: TransactionResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload, unknown type or system account',
  })
  @ApiNotFoundResponse({ description: 'Account not found' })
  @ApiUnprocessableEntityResponse({ description: 'Insufficient funds' })
  async create(
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.transactionsService.create(dto);
    return TransactionResponseDto.fromEntity(transaction);
  }

  @Post('discharges')
  @ApiOperation({
    summary: 'Pay the card bill',
    description:
      'Discharges the account debits from oldest to newest by posting ledger entries on the existing transactions. Any amount beyond what is outstanding is not applied and is returned as remaining_amount.',
  })
  @ApiCreatedResponse({ type: DischargeResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid payload or system account',
  })
  @ApiNotFoundResponse({ description: 'Account not found' })
  async discharge(
    @Body() dto: DischargeTransactionDto,
  ): Promise<DischargeResponseDto> {
    const discharge = await this.transactionsService.transactionDischarge(dto);
    return DischargeResponseDto.fromDischarge(discharge);
  }
}
