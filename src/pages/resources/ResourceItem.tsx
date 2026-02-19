import React from 'react';
import { Box, Card, colors, Typography } from '@mui/material';
import CustomLink from '../../shared-js-css-styles/CustomLink';
import { Image } from 'react-bootstrap';
import { Resource } from './Resources';
import { useAppSelector } from '../../redux-store/hooks';
import Routes from '../../router/routes';

interface ResourceItemProps {
  resource: Resource;
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource }) => {
  const { groupNameFromUrl, courseNameFromUrl } = useAppSelector(
    (state) => state.ManageGroupUrlState
  );

  return (
    <Box marginY="18px">
      <Card>
        <CustomLink
          url={Routes.constructViewResourceDetailRoute(
            groupNameFromUrl ?? null,
            courseNameFromUrl ?? null,
            resource.name
          )}
          color="black"
          activeColor="none"
          activeUnderline={false}
          component="nav-link"
          childComponent={
            <Box>
              <Box
                display="flex"
                height="220px"
                justifyContent="center"
                bgcolor={colors.grey['200']}
              >
                <Image
                  alt={`${resource.name} logo`}
                  src={resource.logo}
                  height="auto"
                  width="100%"
                  style={{ padding: 40, objectFit: 'scale-down' }}
                />
              </Box>

              <Box paddingX="18px" paddingY="20px">
                <Typography variant="subtitle1" align="center" noWrap>
                  <b>{resource.name}</b>
                </Typography>
              </Box>
            </Box>
          }
        />
      </Card>
    </Box>
  );
};

export default ResourceItem;
