import React, { forwardRef } from 'react';

const LazyVideo = forwardRef(({ src, className, ...props }, ref) => {
  return (
    <video
      ref={ref}
      src={src}
      className={className}
      {...props}
    />
  );
});

export default LazyVideo;