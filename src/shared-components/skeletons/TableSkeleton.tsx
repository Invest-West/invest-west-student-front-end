import React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => (
  <Box width="100%">
    {/* Header row */}
    <Box display="flex" gap={2} mb={1} pb={1} borderBottom="1px solid #e0e0e0">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width={`${100 / columns}%`} height={28} />
      ))}
    </Box>
    {/* Data rows */}
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <Box key={rowIdx} display="flex" gap={2} py={1} borderBottom="1px solid #f5f5f5">
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Box>
    ))}
  </Box>
);

export default TableSkeleton;
