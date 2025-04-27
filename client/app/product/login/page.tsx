"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/api/services";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Loader2,
  User,
  Coffee,
  ChevronLeft,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  ageGroup: z.string({
    required_error: "Please select an age group.",
  }),
});

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define form with validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Create user or get existing user
      const response = await userService.createUser({
        name: values.name,
        age_group: values.ageGroup,
        role: "customer",
      });

      if (response.success && response.data) {
        // Store user info in local storage
        localStorage.setItem("userId", response.data.user_id);
        localStorage.setItem("userName", response.data.name);

        // Navigate to recipe categories page
        router.push("/product/recipes");
      } else {
        form.setError("root", {
          message: "Failed to create user. Please try again.",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      form.setError("root", {
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/product/screensaver");
  };

  // SSR safe rendering
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white">WELCOME</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F0F] to-black opacity-80"></div>
        <div className="absolute inset-0">
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-amber-900/5"
              style={{
                width: Math.random() * 4 + 2 + "px",
                height: Math.random() * 4 + 2 + "px",
                top: Math.random() * 100 + "%",
                left: Math.random() * 100 + "%",
              }}
            ></div>
          ))}
        </div>
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      {/* Header - Back Link */}
      <motion.button
        className="absolute top-8 left-8 z-10 flex items-center text-gray-400 hover:text-amber-500 transition-colors bg-transparent border-0"
        whileHover={{ x: -3 }}
        onClick={handleCancel}
      >
        <ChevronLeft size={20} />
        <span className="ml-1 text-sm">Back</span>
      </motion.button>

      {/* Coffee logo at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center z-10"
      >
        <Coffee size={24} className="text-amber-500 mr-2" />
        <h3 className="text-lg font-bold text-white tracking-tight">
          FROTH<span className="text-amber-500">FILTER</span>
        </h3>
      </motion.div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md px-6 mt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-[#141414] backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-[#292929]">
            <div className="px-8 pt-8 pb-6 border-b border-[#292929]">
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0.9, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 100,
                  }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600/20 to-amber-900/10 flex items-center justify-center"
                >
                  <User size={32} className="text-amber-500" />
                </motion.div>
              </div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold text-white text-center"
              >
                WELCOME
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-gray-400 text-center mt-2"
              >
                Tell us a little about yourself to get started
              </motion.p>
            </div>

            <div className="p-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Your Name
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="Enter your name"
                                className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                                {...field}
                              />
                            </FormControl>
                            <User
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                            />
                          </div>
                          <FormDescription className="text-gray-500 text-xs">
                            This is how we&apos;ll address you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.4 }}
                  >
                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">
                            Age Group
                          </FormLabel>
                          <div className="relative">
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white">
                                  <SelectValue placeholder="Select your age group" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1A1A1A] border-[#333] text-white">
                                <SelectItem
                                  value="under-18"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  Under 18
                                </SelectItem>
                                <SelectItem
                                  value="18-24"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  18-24
                                </SelectItem>
                                <SelectItem
                                  value="25-34"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  25-34
                                </SelectItem>
                                <SelectItem
                                  value="35-44"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  35-44
                                </SelectItem>
                                <SelectItem
                                  value="45-54"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  45-54
                                </SelectItem>
                                <SelectItem
                                  value="55-64"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  55-64
                                </SelectItem>
                                <SelectItem
                                  value="65+"
                                  className="focus:bg-amber-900/20 focus:text-amber-200"
                                >
                                  65 and over
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <CalendarDays
                              size={18}
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                            />
                          </div>
                          <FormDescription className="text-gray-500 text-xs">
                            This helps us improve our recommendations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  {form.formState.errors.root && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium text-red-400"
                    >
                      {form.formState.errors.root.message}
                    </motion.p>
                  )}

                  <motion.div
                    className="flex flex-col space-y-3 pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.4 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        className={`w-full h-12 text-base font-medium ${
                          isLoading
                            ? "bg-amber-800/20 text-amber-300/80"
                            : "bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white"
                        }`}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin text-amber-300/80" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <span>Continue</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="w-full border-[#333] text-gray-300 hover:text-white hover:bg-[#1A1A1A] h-12"
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </Form>
            </div>

            <div className="py-4 px-8 border-t border-[#292929] flex justify-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="text-xs text-gray-500"
              >
                By continuing, you agree to our{" "}
                <span className="text-amber-500 hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-amber-500 hover:underline cursor-pointer">
                  Privacy Policy
                </span>
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decorative element at bottom */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-16 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"
        animate={{
          width: ["4rem", "8rem", "4rem"],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatType: "loop",
        }}
      />
    </div>
  );
}
