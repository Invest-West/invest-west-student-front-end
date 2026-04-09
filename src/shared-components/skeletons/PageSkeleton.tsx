import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface PageSkeletonProps {
  rows?: number;
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ rows = 5 }) => (
  <Box padding={3}>
    <Skeleton variant="rectangular" width="40%" height={32} sx={{ mb: 3 }} />
    <Skeleton variant="rectangular" width="100%" height={48} sx={{ mb: 2 }} />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} variant="text" width={`${80 - i * 5}%`} height={24} sx={{ mb: 1 }} />
    ))}
  </Box>
);

export default PageSkeleton;
