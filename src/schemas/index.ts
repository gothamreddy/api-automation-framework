import { errorSchema } from './error.schema.js';
import { postCreateResponseSchema, postListSchema, postSchema } from './post.schema.js';
import { registerSchemas } from './registry.js';
import { userSchema } from './user.schema.js';

registerSchemas({
  Post: postSchema,
  PostList: postListSchema,
  PostCreateResponse: postCreateResponseSchema,
  User: userSchema,
  Error: errorSchema,
});

export { getSchemaByName, listSchemaNames, registerSchema, registerSchemas } from './registry.js';
