import { Context } from "..";

interface UserParentType {
  id: number;
}

export const User = {
  posts: (parent: UserParentType, __: any, { userInfo, prisma }: Context) => {
    const isOwnProfile = parent.id === userInfo?.userId;

    var filter:any = {}
    filter.authorId = parent.id;
    if (!isOwnProfile){
      filter.published = true;
    }

    return prisma.post.findMany({
      where: filter,
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
  },
};
