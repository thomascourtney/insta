import { Post, Prisma } from ".prisma/client";

export interface PostPayloadType {
  userErrors: {
    message: string;
  }[];
  post: Post | Prisma.Prisma__PostClient<Post> | null;
}

export const postErrorResponses = {
    buildErrorResponse: buildErrorResponse,
    buildForbiddenAccessErrorResponse: (): PostPayloadType => {
      return buildErrorResponse("Forbidden access (unauthenticated)");
    }
}

function buildErrorResponse(message: string): PostPayloadType {
  return {
    userErrors: [
      {
        message: message
      }
    ],
    post: null,
  };
}