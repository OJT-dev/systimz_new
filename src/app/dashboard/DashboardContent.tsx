'use client';

import { StreamingAvatar } from '@/components/avatar/StreamingAvatar';
import { AvatarQuality } from '@/services/heygen/types';
import { useToast } from '@/hooks/useToast';

export function DashboardContent() {
  const { showToast } = useToast();

  const handleAvatarError = (error: Error) => {
    console.error('Avatar error:', error);
    showToast(error.message, 'error');
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Interactive Avatar Dashboard</h1>
        
        <div className="grid gap-8">
          {/* Avatar Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Assistant</h2>
            <StreamingAvatar
              avatarId="default"
              quality={AvatarQuality.High}
              className="aspect-video"
              onError={handleAvatarError}
            />
          </section>

          {/* Instructions Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Type your message in the input field below the avatar</li>
              <li>Click &quot;Speak&quot; or press Enter to make the avatar speak</li>
              <li>Use the &quot;Stop&quot; button to interrupt the avatar while speaking</li>
              <li>The green indicator shows when the avatar is speaking</li>
            </ul>
          </section>

          {/* Status Section */}
          <section className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Avatar ID:</span>
                <span className="ml-2 text-gray-600">default</span>
              </div>
              <div>
                <span className="font-medium">Quality:</span>
                <span className="ml-2 text-gray-600">High (720p)</span>
              </div>
              <div>
                <span className="font-medium">Voice ID:</span>
                <span className="ml-2 text-gray-600">2d5b0e6cf36f460aa7fc47e3eee4ba54</span>
              </div>
              <div>
                <span className="font-medium">Language:</span>
                <span className="ml-2 text-gray-600">English</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
