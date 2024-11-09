"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";

interface Avatar {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
}

export default function AvatarStudioPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch("/api/avatars/" + params.id);
        if (!response.ok) {
          throw new Error("Failed to fetch avatar");
        }
        const data = await response.json();
        setAvatar(data);
      } catch (error) {
        showToast("Failed to load avatar", "error");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchAvatar();
    }
  }, [session, params.id, router, showToast]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading studio...</div>
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Avatar not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{avatar.name}</h1>
          {avatar.description && (
            <p className="mt-2 text-gray-600">{avatar.description}</p>
          )}
        </div>
        <Button onClick={() => router.push("/dashboard")}>Exit Studio</Button>
      </div>

      <div className="rounded-lg border bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="text-lg">Avatar Studio - Coming Soon</p>
          <p className="mt-2 text-gray-600">
            This is where you&apos;ll be able to customize and interact with your
            avatar. Stay tuned for updates!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Voice Settings</h3>
            <p className="text-gray-600">
              Customize your avatar&apos;s voice and speech patterns
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Appearance</h3>
            <p className="text-gray-600">
              Modify your avatar&apos;s visual characteristics
            </p>
          </div>

          <div className="rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Behavior</h3>
            <p className="text-gray-600">
              Define your avatar&apos;s personality and responses
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
