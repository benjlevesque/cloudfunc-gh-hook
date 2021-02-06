#  cloudfunc-gh-hook

Run a Github webhook on Google Cloud functions. This is a wrapper around  [@octokit/webhook](https://github.com/octokit/webhooks.js)'s `verifyAndReceive` method  to simplify configuration specific to Google Cloud function.

## Installation

```bash
yarn add cloudfunc-gh-hook
```

## Usage

```typescript
import { handler } from "cloudfunc-gh-hook";

export const main = handler({
  "release.released": (event) => console.log(event),
});

```

## Development & Deployment

See https://github.com/benjlevesque/cloudfunc-gh-hook-template for details about development environment and deployment.


## API

There is only a root endpoint that accepts a `POST` HTTP request.

Possible responses:
- 404 for a non POST request
- 403 for an invalid or missing secret header
- 422 when missing required headers `x-github-delivery`, `x-github-event` and `x-hub-signature`