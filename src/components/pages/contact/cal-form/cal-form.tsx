'use client';

import Cal from '@calcom/embed-react';

const CalForm = () => {
  return (
    <Cal
      calLink="tianzhou/bytebase-product-walkthrough"
      config={{ theme: 'light', branding: { brandColor: '#5647EB' } }}
    />
  );
};

export default CalForm;
