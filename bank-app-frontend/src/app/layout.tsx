'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/store/store';

type Props = {
  children: ReactNode;
};

export default function Providers({ children }: Props) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}