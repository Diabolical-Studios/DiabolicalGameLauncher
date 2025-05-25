import React from 'react';

const StatusBarAndContentPanel = ({ children }) => {
  return <div className={'w-full flex flex-col gap-3 overflow-hidden h-full'}>{children}</div>;
};

export default StatusBarAndContentPanel;
