import { SetMetadata } from '@nestjs/common';

export const OWN_RESOURCE_KEY = 'ownResource';
export const OwnResource = (resourceType: string) =>
  SetMetadata(OWN_RESOURCE_KEY, resourceType);
