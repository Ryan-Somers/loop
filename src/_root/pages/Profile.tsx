import { useUserContext } from "@/context/AuthContext";

const Profile = () => {
  const { user } = useUserContext();

  return (
    <div className="profile-container">
      <img src={user.imageUrl} className={`${"rounded-full w-24 h-24"}`} />
      <div>
        <p className="body-bold">{user.name}</p>
        <p className="text-center small-regular text-light-3">@{user.username}</p>
      </div>
    </div>
  );
};

export default Profile;
