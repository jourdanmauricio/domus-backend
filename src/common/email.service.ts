import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  private async renderTemplate(
    templateName: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      '../../src/templates',
      templateName,
    );
    let template = await fs.promises.readFile(templatePath, 'utf8');
    for (const [key, value] of Object.entries(variables)) {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return template;
  }

  async sendRecoveryPassword(email: string, url: string): Promise<void> {
    const html = await this.renderTemplate('recovery-password.html', { url });
    await this.mailerService.sendMail({
      to: email,
      subject: 'Recuperar contraseña - Domus App',
      html,
    });
  }
}
