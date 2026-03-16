import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PayloadValidationGuard } from 'src/common/guards/payload-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard.guard';
import { currentUser } from 'src/common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard, PayloadValidationGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Patch(':id/success')
  async markSuccess(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentsService.markPaymentSuccess(id, transactionId);
  }

  @Get()
  async findAll() {
    return this.paymentsService.findAll();
  }

  @Get('my')
  async findMyPayments(@currentUser() user: any) {
    return this.paymentsService.findByOwnerId(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
}
