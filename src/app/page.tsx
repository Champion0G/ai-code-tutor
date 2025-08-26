
import { ModeSelection } from '@/components/mode-selection';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <div className="absolute top-4 right-4 space-x-2">
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">Login</Link>
        <Link href="/signup" className="text-sm font-medium text-primary hover:underline">Sign Up</Link>
      </div>
      <ModeSelection />
    </>
  );
}
