"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface DragDropImageUploadProps {
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  label?: string;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function DragDropImageUpload({
  onChange,
  previewUrl,
  className = "",
  label = "Recipe Image",
  maxSizeMB = 5,
  disabled = false,
}: DragDropImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, GIF, etc.)");
      return false;
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback(
    (file: File) => {
      if (!validateFile(file)) {
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
    },
    [maxSizeMB, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onChange(null);

    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor="drag-drop-upload">{label}</Label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 cursor-pointer",
          "hover:border-primary/50 hover:bg-primary/5",
          isDragging && "border-primary bg-primary/10 scale-[1.02]",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive",
          !error && !isDragging && "border-gray-300"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          id="drag-drop-upload"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-64 rounded-lg overflow-hidden group"
            >
              <Image
                src={preview}
                alt="Image preview"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />

              {/* Overlay with remove button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="shadow-lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </motion.div>
              </div>

              {/* Change image button */}
              <div className="absolute top-2 right-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="shadow-lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isDragging
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {isDragging ? (
                  <Upload className="h-8 w-8 animate-bounce" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>

              <p className="text-sm font-medium text-gray-700 mb-1">
                {isDragging
                  ? "Drop your image here"
                  : "Drag & drop an image here"}
              </p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={disabled}
              >
                <Upload className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                Max file size: {maxSizeMB}MB. Supported: JPEG, PNG, GIF, WebP
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
}
