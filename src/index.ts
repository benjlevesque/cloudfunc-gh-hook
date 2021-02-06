import { Webhooks } from '@octokit/webhooks';
import { EmitterEventWebhookPayloadMap } from '@octokit/webhooks/dist-types/generated/get-webhook-payload-type-from-event';
import { Request, Response } from 'express';

type PartialWebhookEventHandlers = {
  [P in keyof EmitterEventWebhookPayloadMap]?: (
    payload: EmitterEventWebhookPayloadMap[P]
  ) => Promise<void> | void;
};

export const keys = Object.keys as <T>(o: T) => Extract<keyof T, string>[];

export const handler = (
  handlers: PartialWebhookEventHandlers,
  secret: string = process.env.WEBHOOK_SECRET || ''
) => {
  const webhooks = new Webhooks({
    secret,
  });

  for (const event of keys(handlers)) {
    const callback: any = handlers[event]!;
    webhooks.on(event, ev => callback(ev.payload));
  }

  return async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
      res.status(404).send();
      return;
    }
    try {
      await webhooks.verifyAndReceive({
        id: req.headers['x-github-delivery'] || '',
        name: req.headers['x-github-event'] || '',
        payload: req.body,
        signature: req.headers['x-hub-signature'] || '',
      });
      res.status(200).send('OK');
    } catch (err) {
      if (
        err.message ===
        '[@octokit/webhooks] secret, eventPayload & signature required'
      ) {
        res.status(422).send('missing required header(s)');
      } else {
        res.status(403).send('invalid signature');
      }
    }
  };
};
