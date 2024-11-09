"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export default function EditAvatarPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch("/api/avatars/" + params.id);
        if (!response.ok) {
          throw new Error("Failed to fetch avatar");
        }
        const data = await response.json();
        setFormData({
          name: data.name,
          description: data.description || "",
        });
      } catch (err) {
        const error = err instanceof Error ? err.message : "Failed to load avatar";
        showToast(error, "error");
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchAvatar();
    }
  }, [session, params.id, router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showToast("Avatar name is required", "error");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/avatars/" + params.id, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update avatar");
      }

      showToast("Avatar updated successfully", "success");
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to update avatar";
      showToast(error, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this avatar?")) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/avatars/" + params.id, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete avatar");
      }

      showToast("Avatar deleted successfully", "success");
      router.push("/dashboard");
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to delete avatar";
      showToast(error, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Avatar</h1>
        <p className="mt-2 text-gray-600">
          Update your avatar&apos;s details below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter avatar name"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Enter avatar description (optional)"
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDelete}
            disabled={isSaving}
            className="ml-auto !bg-red-50 !text-red-600 hover:!bg-red-100"
          >
            Delete Avatar
          </Button>
        </div>
      </form>
    </div>
  );
}
