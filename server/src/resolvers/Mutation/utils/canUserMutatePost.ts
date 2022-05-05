import { Context } from "../../..";
import { postErrorResponses } from "./postResponse"

interface CanUserMutatePostParams {
  userId: number;
  postId: number;
  prisma: Context["prisma"];
}

export const canUserMutatePost = async ({
  userId,
  postId,
  prisma,
}: CanUserMutatePostParams) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return postErrorResponses.buildErrorResponse("User not found");
  }

  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (post?.authorId !== user.id) {
    return postErrorResponses.buildErrorResponse("Post not owned by user");
  }
};
