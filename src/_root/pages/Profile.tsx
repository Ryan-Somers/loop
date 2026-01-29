import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queriesAndMutations";
import { Link, Outlet, useLocation, useParams } from "react-router-dom";

interface StatBlockProps {
  value: string | number;
  label: string;
}

const StatBlock = ({ value, label }: StatBlockProps) => (
  <div className="flex-center gap-2">
    <p className="small-semibold lg:body-bold text-primary-500">{value}</p>
    <p className="small-medium lg:base-medium text-light-2">{label}</p>
  </div>
);

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: profileUser, isPending } = useGetUserById(id || "");

  if (isPending) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">User not found</p>
      </div>
    );
  }

  const showLikedPosts = pathname === `/profile/${id}/liked-posts`;

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={profileUser.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full">
                {profileUser.name}
              </h1>
              <p className="small-regular md:body-medium text-light-3 text-center xl:text-left">
                @{profileUser.username}
              </p>
            </div>

            <div className="flex gap-8 mt-10 items-center justify-center xl:justify-start flex-wrap z-20">
              <StatBlock value={profileUser.posts?.length || 0} label="Posts" />
              <StatBlock value={0} label="Followers" />
              <StatBlock value={0} label="Following" />
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm">
              {profileUser.bio || "No bio yet."}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user.id === profileUser._id ? (
              <Link to={`/update-profile/${profileUser._id}`}>
                <Button className="shad-button_primary px-8">
                  <img
                    src="/assets/icons/edit.svg"
                    className=""
                    alt="edit"
                    width={20}
                    height={20}
                  />
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button className="shad-button_primary px-8">Follow</Button>
            )}
          </div>
        </div>
      </div>

      {user.id === profileUser._id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              !showLikedPosts && "!bg-dark-3"
            }`}
          >
            <img
              src="/assets/icons/posts.svg"
              alt="posts"
              width={20}
              height={20}
            />
            Posts
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              showLikedPosts && "!bg-dark-3"
            }`}
          >
            <img
              src="/assets/icons/like.svg"
              alt="like"
              width={20}
              height={20}
            />
            Liked Posts
          </Link>
        </div>
      )}

      {showLikedPosts ? (
        profileUser.likedPosts && profileUser.likedPosts.length > 0 ? (
          <GridPostList posts={profileUser.likedPosts} showStats={false} />
        ) : (
          <p className="text-light-4">No liked posts</p>
        )
      ) : (
        profileUser.posts && profileUser.posts.length > 0 ? (
          <GridPostList posts={profileUser.posts} showUser={false} />
        ) : (
          <p className="text-light-4">No posts yet</p>
        )
      )}
      <Outlet />
    </div>
  );
};

export default Profile;
