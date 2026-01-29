import Loader from "@/components/shared/Loader";
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useDeletePost, useGetPostById } from "@/lib/react-query/queriesAndMutations";
import { multiFormatDateString } from "@/lib/utils";
import { Link, useNavigate, useParams } from "react-router-dom";

const PostDetails = () => {
  const { id } = useParams();
  const { data: post, isPending } = useGetPostById(id || "");
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { mutate: deletePost } = useDeletePost();
  const creator = post?.creator;

  const handleDeletePost = () => {
    if (post) {
      deletePost({ postId: post._id, imageId: post.imageStorageId || "" });
      navigate("/");
    }
  };

  return (
    <div className="post_details-container">
      {isPending ? (
        <Loader />
      ) : (
        <div className="post_details-card">
          <img src={post?.imageUrl} alt="creator" className="post_details-img" />

          <div className="post_details-info">
            <div className="w-full flex-between">
              {creator ? (
                <Link to={`/profile/${creator._id}`} className="flex items-center gap-3">
                  <img src={creator.imageUrl || "/assets/icons/profile-placeholder.svg"} alt="creator" className="w-8 h-8 rounded-full lg:h-12 lg:w-12" />

                  <div className="flex flex-col ">
                    <p className="base-medium lg:body-bold text-light-1">{creator.name}</p>
                    <div className="gap-2 flex-center text-light-3">
                      <p className="subtle-semibold lg:small-regular">{multiFormatDateString(post?._creationTime)}</p>-
                      <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3">
                  <img src="/assets/icons/profile-placeholder.svg" alt="creator" className="w-8 h-8 rounded-full lg:h-12 lg:w-12" />
                  <div className="flex flex-col ">
                    <p className="base-medium lg:body-bold text-light-1">Unknown creator</p>
                    <div className="gap-2 flex-center text-light-3">
                      <p className="subtle-semibold lg:small-regular">{multiFormatDateString(post?._creationTime)}</p>-
                      <p className="subtle-semibold lg:small-regular">{post?.location}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="gap-4 flex-center">
                <Link to={`/update-post/${post?._id}`} className={`${user.id !== creator?._id && "hidden"}`}>
                  <img src="/assets/icons/edit.svg" width={24} height={24} alt="edit" />
                </Link>
                <Button onClick={handleDeletePost} variant="ghost" className={`ghost_details-delete_btn ${user.id !== creator?._id && "hidden"}`}>
                  <img src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
                </Button>
              </div>
            </div>
            <hr className="w-full border border-dark-4/80" />

            <div className="flex flex-col flex-1 w-full small-medium lg:base-regular">
              <p>{post?.caption}</p>
              <ul className="flex gap-1 mt-2">
                {post?.tags.map((tag: string) => (
                  <li key={tag} className="text-light-3">
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <PostStats post={post} userId={user.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetails;
