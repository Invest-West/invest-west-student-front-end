import React from 'react';
import { resources } from '../Resources';
import { Navigate, useParams } from 'react-router-dom';
import Routes from '../../../router/routes';

const ResourceDetail: React.FC = () => {
  const { resourceName } = useParams();
  const resource = resources.find((r) => r.name === resourceName);

  if (resource) {
    return resource.page;
  }

  return <Navigate to={Routes.error404} replace />;
};

export default ResourceDetail;
