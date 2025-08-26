import { MainLayout } from '@/components/main-layout';
import { GamificationProvider } from '@/contexts/gamification-context';

export default function ExplainerPage() {
  return (
    <GamificationProvider>
      <MainLayout />
    </GamificationProvider>
  );
}
