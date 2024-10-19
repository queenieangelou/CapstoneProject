/* eslint-disable */
import { useGetIdentity, useOne } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { Profile } from 'components';

interface UserProfile {
  name: string;
  avatar: string;
  email: string;
  allProperties: any[]; // Replace 'any[]' with a more specific type if possible
  isAdmin: boolean;
}

const MyProfile = () => {
  const { data: user } = useGetIdentity();
  const { data, isLoading, isError } = useOne<UserProfile>({
    resource: 'users',
    id: user?.userid,
  });
  const navigate = useNavigate();
  const myProfile: UserProfile | undefined = data?.data;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  return (
    <div>
      {myProfile && (
        <Profile
          type="My"
          name={myProfile.name}
          avatar={myProfile.avatar}
          email={myProfile.email}
          properties={myProfile.allProperties}
          isAdmin={myProfile.isAdmin}
        />
      )}
    </div>
  );
};

export default MyProfile;
