import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Auth
  JWT_SECRET: Joi.string().min(10).required(),
  JWT_EXPIRES_IN: Joi.string().default('1d'),

  // Admin seeder
  ADMIN_EMAIL: Joi.string().email().required(),
  ADMIN_PASSWORD: Joi.string().min(6).required(),

  // DB
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // SMTP Configuration
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.number().default(587),
  EMAILS_FROM: Joi.string().email().required(),
  SMTP_PASSWORD: Joi.string().required(),

  // Optional extras
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  // Frontend URL
  FRONTEND_URL: Joi.string().required(),
});
