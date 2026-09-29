import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppService } from './app.service';

vi.mock('node:fs', () => ({ readFileSync: vi.fn() }));

describe('AppService', () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({
        name: 'test-app',
        version: '1.2.3',
        scripts: { start: 'nest start' },
      }),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should read the package.json at the project root', () => {
    new AppService();

    expect(readFileSync).toHaveBeenCalledWith(
      join(process.cwd(), 'package.json'),
      'utf-8',
    );
  });

  it('should return only the name and version from package.json', () => {
    const appService = new AppService();

    expect(appService.getVersion()).toEqual({
      name: 'test-app',
      version: '1.2.3',
    });
  });
});
