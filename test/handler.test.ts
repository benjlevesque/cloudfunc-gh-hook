import { handler } from '../src';
import { payload, headers } from './fixtures/release.json';

const mockHttp = (method: string, payload: any, headers: any) => {
  const req: any = {
    method,
    body: payload,
    headers: Object.keys(headers).reduce((prev, curr) => {
      prev[curr] = headers[curr];
      prev[curr.toLowerCase()] = headers[curr];
      return prev;
    }, {}),
  };
  const res: any = {
    status: jest.fn().mockImplementation(() => res),
    send: jest.fn(),
  };

  return { req, res };
};

describe('constructor', () => {
  it('throws an error on missing secret', () => {
    expect(() => handler({})).toThrowError(
      '[@octokit/webhooks] options.secret required'
    );
  });

  it('accepts a secret as parameter', () => {
    expect(() => handler({}, 'abcd')).not.toThrow();
  });

  it('accepts a secret as environment variable', () => {
    process.env.WEBHOOK_SECRET = 'abcd';
    expect(() => handler({}, 'abcd')).not.toThrow();
    process.env.WEBHOOK_SECRET = undefined;
  });
});

describe('handler', () => {
  it('calls the right method', async () => {
    const prereleaseHandler = jest.fn();
    const releaseHandler = jest.fn();
    const { req, res } = mockHttp('POST', payload, headers);
    await handler(
      {
        'release.released': releaseHandler,
        'release.prereleased': prereleaseHandler,
      },
      'abcd'
    )(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('OK');
    expect(releaseHandler).toHaveBeenCalled();
    expect(prereleaseHandler).not.toHaveBeenCalled();
  });

  describe('errors', () => {
    it('returns 404 on GET', async () => {
      const { req, res } = mockHttp('GET', payload, headers);
      const prereleaseHandler = jest.fn();
      const releaseHandler = jest.fn();
      await handler(
        {
          'release.released': releaseHandler,
          'release.prereleased': prereleaseHandler,
        },
        'abcd'
      )(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(releaseHandler).not.toHaveBeenCalled();
      expect(prereleaseHandler).not.toHaveBeenCalled();
    });

    it('returns 422 on missing headers', async () => {
      const { req, res } = mockHttp('POST', payload, {});
      const prereleaseHandler = jest.fn();
      const releaseHandler = jest.fn();
      await handler(
        {
          'release.released': releaseHandler,
          'release.prereleased': prereleaseHandler,
        },
        'abcd'
      )(req, res);
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.send).toHaveBeenCalledWith('missing required header(s)');
      expect(releaseHandler).not.toHaveBeenCalled();
      expect(prereleaseHandler).not.toHaveBeenCalled();
    });

    it('returns 403 on invalid signature', async () => {
      const { req, res } = mockHttp('POST', payload, {
        ...headers,
        'X-Hub-Signature': 'wrong',
      });
      const prereleaseHandler = jest.fn();
      const releaseHandler = jest.fn();
      await handler(
        {
          'release.released': releaseHandler,
          'release.prereleased': prereleaseHandler,
        },
        'abcd'
      )(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.send).toHaveBeenCalledWith('invalid signature');
      expect(releaseHandler).not.toHaveBeenCalled();
      expect(prereleaseHandler).not.toHaveBeenCalled();
    });
  });
});
