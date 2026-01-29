import Loader from "@/components/shared/Loader";
import { useGetUsers } from "@/lib/react-query/queriesAndMutations";
import { Link } from "react-router-dom";

const AllUsers = () => {
  const { data: users, isPending, isError } = useGetUsers();

  if (isError) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">Something went wrong</p>
      </div>
    );
  }

  return (
    <div className="common-container">
      <div className="user-container">
        <h2 className="h3-bold md:h2-bold text-left w-full">All Users</h2>
        {isPending ? (
          <Loader />
        ) : (
          <ul className="user-grid">
            {users?.map((user: any) => (
              <li key={user._id} className="flex-1 min-w-[200px] w-full">
                <Link to={`/profile/${user._id}`} className="user-card">
                  <img
                    src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                    alt="user"
                    className="rounded-full w-14 h-14"
                  />
                  <div className="flex-center flex-col gap-1">
                    <p className="base-medium text-light-1 text-center line-clamp-1">
                      {user.name}
                    </p>
                    <p className="small-regular text-light-3 text-center line-clamp-1">
                      @{user.username}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
