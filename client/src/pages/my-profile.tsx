import { useGetIdentity, useOne } from '@pankod/refine-core';
import { useNavigate } from '@pankod/refine-react-router-v6';
import { CustomButton, Profile } from 'components'; // Single import from 'components'
import AddIcon from '@mui/icons-material/Add';

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

      {myProfile?.isAdmin && (
        <CustomButton
          type="button"
          title="Add New User"
          backgroundColor="#4CAF50" // Example background color
          color="#fff" // Example text color
          fullWidth={false}
          icon={<AddIcon />} // Example icon
          handleClick={() => navigate('/add-user')}
          disabled={false} // Optionally set to true or based on condition
        />
      )}
    </div>
  );
};

export default MyProfile;
