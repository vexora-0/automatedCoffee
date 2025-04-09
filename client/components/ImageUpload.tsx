"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  label?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onChange,
  previewUrl,
  className = "",
  label = "Image",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        onChange(null);
        return;
      }

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`Image size must be less than ${maxSizeMB}MB`);
        onChange(null);
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Pass file to parent component
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);

    // Reset file input value
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-32 h-32 border rounded overflow-hidden bg-gray-100">
          {preview ? (
            <Image
              src={preview}
              alt="Image preview"
              fill
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div>
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image-upload")?.click()}
              className="mb-1"
            >
              {preview ? "Change Image" : "Upload Image"}
            </Button>

            {preview && (
              <Button
                type="button"
                variant="ghost"
                className="ml-2 text-red-500"
                onClick={handleRemove}
              >
                Remove
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          <p className="text-xs text-gray-500">
            Max file size: {maxSizeMB}MB. Supported formats: JPEG, PNG, GIF
          </p>
        </div>
      </div>
    </div>
  );
}
