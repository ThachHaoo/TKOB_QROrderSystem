import { Module } from '@nestjs/common';
import { TableController } from './controllers/table.controller';
import { PublicTableController } from './controllers/public-table.controller';
import { TableService } from './services/table.service';
import { QrService } from './services/qr.service';
import { PdfService } from './services/pdf.service';
import { TableRepository } from './repositories/table.repository';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [MenuModule],
  controllers: [TableController, PublicTableController],
  providers: [
    // Services
    TableService,
    QrService,
    PdfService,

    // Repositories
    TableRepository,
  ],
  exports: [
    // Export for use in other modules (e.g., Order module)
    TableService,
    QrService,
  ],
})
export class TableModule {}
