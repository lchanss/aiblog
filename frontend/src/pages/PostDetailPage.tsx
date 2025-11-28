import { Navigate, useNavigate, useParams } from "react-router";

import { PATHS } from "@/constants/paths";
import { deletePost } from "@/features/post/api/deletePost";
import { getPost } from "@/features/post/api/getPost";
import PostDetail from "@/features/post/components/PostDetail";
import Button from "@/shared/ui/Button";

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const post = postId ? getPost(postId) : null;

  if (!post) {
    return <Navigate to={PATHS.notFound.getHref()} replace />;
  }

  const goToList = () => {
    navigate(PATHS.home.getHref());
  };

  const handleDelete = () => {
    if (confirm("정말로 이 포스트를 삭제하시겠습니까?")) {
      const success = deletePost(post.id);
      if (success) {
        alert("포스트가 삭제되었습니다.");
        navigate(PATHS.home.getHref());
      } else {
        alert("포스트 삭제에 실패했습니다.");
      }
    }
  };

  return (
    <>
      <div className="mx-auto flex max-w-4xl gap-3 px-4 pt-8">
        <Button onClick={goToList}>목록으로</Button>
        <button
          onClick={handleDelete}
          className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
        >
          삭제
        </button>
      </div>

      <PostDetail post={post} />
    </>
  );
}
