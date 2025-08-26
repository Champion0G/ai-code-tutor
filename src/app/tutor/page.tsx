import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TutorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold mb-4">Topic Tutor Mode</h1>
      <p className="text-muted-foreground mb-8">This feature is under construction.</p>
      <Link href="/">
        <Button>Back to Mode Selection</Button>
      </Link>
    </div>
  );
}
