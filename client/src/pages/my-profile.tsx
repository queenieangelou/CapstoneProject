import { useGetIdentity, useOne } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { CustomButton, Profile } from 'components'; // Single import from 'components'


const MyProfile = () => {
  const { data: user } = useGetIdentity();
  const { data, isLoading, isError } = useOne({
    resource: 'users',
    id: user?.userid,
  });

  const navigate = useNavigate();

  const myProfile = data?.data ?? [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Something went wrong!</div>;
  }

  return (
    <div>
      <Profile
        type="My"
        name={myProfile?.name}
        avatar={myProfile?.avatar}
        email={myProfile?.email}
        properties={myProfile?.allProperties}
        isAdmin={myProfile?.isAdmin}
      />
    </div>
  );
};

export default MyProfile;
