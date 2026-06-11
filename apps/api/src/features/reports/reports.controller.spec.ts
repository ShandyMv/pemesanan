import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  it('delegates transaction report query', () => {
    const service = { getTransactions: jest.fn() } as unknown as ReportsService;
    const controller = new ReportsController(service);
    const query = { startDate: '2026-05-01', endDate: '2026-05-31' };

    controller.getTransactions(query);
    expect(service.getTransactions).toHaveBeenCalledWith(query);
  });
});
