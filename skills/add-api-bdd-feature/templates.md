# Templates

## Feature (`features/comments/list.feature`)

```gherkin
@epic:Comments @feature:List
Feature: Comments API

  @smoke @regression @story:ListComments @severity:normal
  Scenario: List comments for a post
    When I send a GET request to "/comments" with query params:
      | postId | 1 |
    Then the response status should be 200
    And the response body should match schema "CommentList"
    And the response time should be under 5000 ms
```

## Domain assertions (`src/assertions/comments.assertions.ts`)

```ts
import { expect } from '@playwright/test';

export function assertAllCommentsBelongToPost(body: unknown, postId: number): void {
  if (!Array.isArray(body)) {
    throw new Error('Expected response body to be an array');
  }
  for (const item of body) {
    expect((item as { postId: number }).postId).toBe(postId);
  }
}
```

Register in `src/assertions/index.ts`:

```ts
export { assertAllCommentsBelongToPost } from './comments.assertions.js';
```

## Domain steps (`steps/comments.steps.ts`)

```ts
import { Then } from './fixtures.js';
import { assertAllCommentsBelongToPost } from '../src/assertions/index.js';

Then('each comment should belong to post {int}', async ({ world }, postId) => {
  assertAllCommentsBelongToPost(world.lastResponseBody, postId);
});
```

## Zod schema (`src/schemas/comment.schema.ts` + index registry)

```ts
import { z } from 'zod';

export const commentSchema = z.object({
  postId: z.number(),
  id: z.number(),
  name: z.string(),
  email: z.string(),
  body: z.string(),
});

export const commentListSchema = z.array(commentSchema);
```

Add to `src/schemas/index.ts`: `CommentList: commentListSchema`.
