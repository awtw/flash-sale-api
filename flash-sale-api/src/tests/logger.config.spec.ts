import { LoggerService } from '../config/logger.config';

describe('LoggerService', () => {
  let logger: LoggerService;

  beforeEach(() => {
    logger = new LoggerService();
    jest.spyOn(process.stdout, 'write').mockImplementation(() => true); // Mock `process.stdout`
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('應該正確記錄日誌', () => {
    logger.log('測試訊息');
    expect(console.log).toHaveBeenCalledWith('[INFO] 測試訊息');
  });

  it('應該正確記錄警告', () => {
    logger.warn('測試警告');
    expect(console.warn).toHaveBeenCalledWith('[WARNING] 測試警告');
  });

  it('應該正確記錄錯誤', () => {
    logger.error('測試錯誤', 'error');
    expect(console.error).toHaveBeenCalledWith('[ERROR] 測試錯誤', 'error');
  });

   it('應該正確記錄debug', () => {
    logger.debug('測試debug');
    expect(console.debug).toHaveBeenCalledWith('[DEBUG] 測試debug');
  });
});
