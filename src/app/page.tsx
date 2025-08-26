import { MainLayout } from '@/components/main-layout';
import { GamificationProvider } from '@/contexts/gamification-context';

export default function Home() {
  return (
    <GamificationProvider>
      <MainLayout />
    </GamificationProvider>
  );
}
