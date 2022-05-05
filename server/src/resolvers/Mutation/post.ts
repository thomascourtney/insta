import { Post, Prisma } from ".prisma/client";
import { Context } from "../../index";
import { canUserMutatePost } from "./utils/canUserMutatePost";
import { PostPayloadType, postErrorResponses } from "./utils/postResponse"

interface PostArgs {
  post: {
    title?: string;
    content?: string;
  };
}

export const postResolvers = {
  postCreate: async (
    _: any,
    { post }: PostArgs,
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return postErrorResponses.buildForbiddenAccessErrorResponse();
    }

    const { title, content } = post;
    if (!title || !content) {
      return postErrorResponses.buildErrorResponse("You must provide title and content to create a post");
    }

    return {
      userErrors: [],
      post: prisma.post.create({
        data: {
          title,
          content,
          authorId: userInfo.userId,
        },
      }),
    };
  },
  postUpdate: async (
    _: any,
    { post, postId }: { postId: string; post: PostArgs["post"] },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return postErrorResponses.buildForbiddenAccessErrorResponse();
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (error) return error;

    const { title, content } = post;

    if (!title && !content) {
      return postErrorResponses.buildErrorResponse("Need to have at least on e field to update");
    }

    const existingPost = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!existingPost) {
      return postErrorResponses.buildErrorResponse("Post does not exist");
    }

    let payloadToUpdate = {
      title,
      content,
    };

    if (!title) delete payloadToUpdate.title;
    if (!content) delete payloadToUpdate.content;

    return {
      userErrors: [],
      post: prisma.post.update({
        data: {
          ...payloadToUpdate,
        },
        where: {
          id: Number(postId),
        },
      }),
    };
  },
  postDelete: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return postErrorResponses.buildForbiddenAccessErrorResponse();
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (error) return error;

    const post = await prisma.post.findUnique({
      where: {
        id: Number(postId),
      },
    });

    if (!post) {
      return postErrorResponses.buildErrorResponse("Post does not exist");
    }

    await prisma.post.delete({
      where: {
        id: Number(postId),
      },
    });

    return {
      userErrors: [],
      post,
    };
  },
  postPublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return postErrorResponses.buildForbiddenAccessErrorResponse();
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (error) return error;

    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          published: true,
        },
      }),
    };
  },
  postUnpublish: async (
    _: any,
    { postId }: { postId: string },
    { prisma, userInfo }: Context
  ): Promise<PostPayloadType> => {
    if (!userInfo) {
      return postErrorResponses.buildForbiddenAccessErrorResponse();
    }

    const error = await canUserMutatePost({
      userId: userInfo.userId,
      postId: Number(postId),
      prisma,
    });

    if (error) return error;

    return {
      userErrors: [],
      post: prisma.post.update({
        where: {
          id: Number(postId),
        },
        data: {
          published: false,
        },
      }),
    };
  },
};
