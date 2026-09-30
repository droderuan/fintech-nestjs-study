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
}
