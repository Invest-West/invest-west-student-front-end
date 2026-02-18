import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface CardSkeletonProps {
  cards?: number;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ cards = 3 }) => (
  <Box display="flex" flexWrap="wrap" gap={2}>
    {Array.from({ length: cards }).map((_, i) => (
      <Box key={i} width={280}>
        <Skeleton variant="rectangular" width="100%" height={160} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width="70%" height={28} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="90%" height={20} />
        <Skeleton variant="text" width="50%" height={20} />
      </Box>
    ))}
  </Box>
);

export default CardSkeleton;
