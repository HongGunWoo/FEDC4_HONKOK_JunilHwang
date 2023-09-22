import { useMutation } from '@tanstack/react-query';
import { snsApiClient } from '~/api';
import { useInfiniteScroll } from '~/hooks';
import { Post } from '~/types';

interface SignIn {
  email: string;
  password: string;
}

interface SignUp {
  email: string;
  fullName: string;
  password: string;
}

interface GetUserPosts {
  authorId: string;
  limit?: number;
  offset?: number;
}

/**
 * @todo title에 JSON.stringify를 사용하지 않은 데이터가 들어 있어서 JSON.parse를 하면 오류발생
 * 해당 오류를 해결하기 위해 만든 함수, 데이터 입력을 title, content로 확실하게 받은 이후 삭제 예상
 */
const parsePostTitle = (postTitle: string): Pick<Post, 'title' | 'content'> => {
  try {
    const { title, content } = JSON.parse(postTitle);

    return { title, content };
  } catch (error) {
    return { title: postTitle, content: ' ' };
  }
};

const signIn = async ({ email, password }: SignIn) => {
  return await snsApiClient.post('/login', { email, password });
};

const signUp = async ({ email, fullName, password }: SignUp) => {
  return await snsApiClient.post('/signup', { email, fullName, password });
};

const getPosts = async ({
  authorId,
  limit,
  offset
}: GetUserPosts): Promise<Post[]> => {
  const response = await snsApiClient.get(`/posts/author/${authorId}`, {
    params: { limit, offset }
  });

  const parsedData = response.data.map((post: Post) => {
    const { title, content } = parsePostTitle(post.title);

    return { ...post, title, content };
  });

  return parsedData;
};

export const getUserInfo = async ({ id }: { id: string }) => {
  const response = await snsApiClient.get(`/users/${id}`);

  return response.data;
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: signIn,
    onSuccess: ({ data }) => {
      window.localStorage.setItem('token', data.token);
    }
  });
};

export const useSignUp = () => {
  return useMutation({ mutationFn: signUp });
};

export const useGetUserPosts = ({
  authorId,
  limit
}: Omit<GetUserPosts, 'offset'>) => {
  return useInfiniteScroll({
    fetchData: (pageParam) => getPosts({ authorId, limit, offset: pageParam })
  });
};
