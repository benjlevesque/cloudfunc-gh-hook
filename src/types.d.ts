import { ToWebhookEvent } from '@octokit/webhooks/dist-types/types';

declare module 'http' {
  import * as stream from 'stream';
  import { URL } from 'url';
  import { Socket, Server as NetServer } from 'net';

  // incoming headers will never contain number
  interface IncomingHttpHeaders extends NodeJS.Dict<string | string[]> {
    'x-github-delivery'?: string;
    'x-github-event'?: ToWebhookEvent<TName>;
    'x-hub-signature'?: string;
  }
}
