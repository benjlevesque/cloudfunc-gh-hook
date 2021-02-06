import { handler } from '../src';
import { payload, headers } from './fixtures/release.json';

const mockHttp = (payload: any, headers: any) => {
  const req: any = {
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

describe('handler', () => {
  it('calls the right method', async () => {
    const prereleaseHandler = jest.fn();
    const releaseHandler = jest.fn();
    const { req, res } = mockHttp(payload, headers);
    await handler(
      {
        'release.released': releaseHandler,
        'release.prereleased': prereleaseHandler,
      },
      'abcd'
    )(req, res);

    expect(res.send).toHaveBeenCalledWith('OK');
    expect(releaseHandler).toHaveBeenCalled();
    expect(prereleaseHandler).not.toHaveBeenCalled();
  });
});
