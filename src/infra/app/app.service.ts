import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

@Injectable()
export class AppService {
  private readonly packageInfo = this.readPackageInfo();

  getVersion() {
    return this.packageInfo;
  }

  private readPackageInfo(): { name: string; version: string } {
    const { name, version } = JSON.parse(
      readFileSync(join(__dirname, '../../../package.json'), 'utf-8'),
    );
    return { name, version };
  }
}
