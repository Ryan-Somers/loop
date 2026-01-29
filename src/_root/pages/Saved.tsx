import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import { useGetCurrentUser } from "@/lib/react-query/queriesAndMutations";

const Saved = () => {
  const { data: currentUser, isPending } = useGetCurrentUser();

  if (isPending) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  const savedPosts = currentUser?.saves
    ?.map((save: any) => save.post)
    .filter(Boolean) || [];

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src="/assets/icons/save.svg"
          width={36}
          height={36}
          alt="saved"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {savedPosts.length === 0 ? (
        <p className="text-light-4">No saved posts yet</p>
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          <GridPostList posts={savedPosts} showStats={false} />
        </ul>
      )}
    </div>
  );
};

export default Saved;
