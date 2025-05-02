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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Loader2,
  User,
  Coffee,
  ChevronLeft,
  ArrowRight,
  Phone,
  Check,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define phone number validation schema
const phoneFormSchema = z.object({
  phone_number: z
    .string()
    .min(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .max(10, {
      message: "Phone number must be exactly 10 digits.",
    })
    .regex(/^\d{10}$/, {
      message: "Please enter a valid 10-digit phone number.",
    }),
});

// Define user info validation schema
const userInfoFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  date_of_birth: z.string().refine((val) => {
    // Check if the date is valid and not in the future
    const date = new Date(val);
    const today = new Date();
    return !isNaN(date.getTime()) && date <= today;
  }, {
    message: "Please enter a valid date of birth.",
  }),
});

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter name (if new user)
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Check if machine ID is stored
    const machineId = localStorage.getItem("machineId");
    
    if (!machineId) {
      // No machine ID, redirect to machine authentication
      router.push("/product/auth/machine");
      return;
    }

    // Check if user is already logged in
    const userId = sessionStorage.getItem("userId");
    const userName = sessionStorage.getItem("userName");
    
    if (userId && userName && isMounted) {
      // User is already logged in, redirect to recipes page
      router.push("/product/recipes");
    }
  }, [router, isMounted]);

  // Define phone form with validation
  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phone_number: "",
    },
  });

  // Define user info form with validation
  const userInfoForm = useForm<z.infer<typeof userInfoFormSchema>>({
    resolver: zodResolver(userInfoFormSchema),
    defaultValues: {
      name: "",
      date_of_birth: "",
    },
  });

  const checkPhoneNumber = async (values: z.infer<typeof phoneFormSchema>) => {
    setIsLoading(true);
    setStatusMessage(null);
    
    try {
      // Check if user exists by phone number
      const response = await userService.checkUserByPhone({
        phone_number: values.phone_number,
      });

      if (response.success) {
        if (response.exists && response.data) {
          // Show success message
          setStatusMessage({
            type: "success",
            message: "Welcome back! Logging you in...",
          });
          
          // Existing user - store user info and redirect
          setTimeout(() => {
            sessionStorage.setItem("userId", response.data.user_id);
            sessionStorage.setItem("userName", response.data.name);
            
            // Navigate to recipe categories page
            router.push("/product/recipes");
          }, 1000);
        } else {
          // New user - proceed to collect name
          setPhoneNumber(values.phone_number);
          setStep(2);
          // Reset userInfoForm
          userInfoForm.reset({
            name: "",
            date_of_birth: "",
          });
        }
      } else {
        setStatusMessage({
          type: "error",
          message: "Failed to check phone number. Please try again.",
        });
      }
    } catch (error) {
      console.error("Phone check error:", error);
      setStatusMessage({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewUser = async (values: z.infer<typeof userInfoFormSchema>) => {
    setIsLoading(true);
    setStatusMessage(null);
    
    try {
      // Format date of birth
      const dob = new Date(values.date_of_birth);
      
      // Create new user with name, phone number, and DOB
      const response = await userService.createUser({
        name: values.name,
        phone_number: phoneNumber,
        date_of_birth: dob.toISOString(),
        role: "customer",
      });

      if (response.success && response.data) {
        // Show success message
        setStatusMessage({
          type: "success",
          message: "Account created successfully!",
        });
        
        // Store user info in session storage
        setTimeout(() => {
          sessionStorage.setItem("userId", response.data.user_id);
          sessionStorage.setItem("userName", response.data.name);

          // Navigate to recipe categories page
          router.push("/product/recipes");
        }, 1000);
      } else {
        setStatusMessage({
          type: "error",
          message: "Failed to create account. Please try again.",
        });
      }
    } catch (error) {
      console.error("User creation error:", error);
      setStatusMessage({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/product/screensaver");
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setStatusMessage(null);
    } else {
      handleCancel();
    }
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
        onClick={handleBack}
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
                  {step === 1 ? (
                    <Phone size={32} className="text-amber-500" />
                  ) : (
                    <User size={32} className="text-amber-500" />
                  )}
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
                {step === 1
                  ? "Enter your phone number to continue"
                  : "Tell us about yourself to complete signup"}
            </motion.p>
          </div>

            <div className="p-8">
              {/* Status Message */}
              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mb-4"
                >
                  <Alert
                    variant={statusMessage.type === "success" ? "default" : "destructive"}
                    className={`border ${
                      statusMessage.type === "success" 
                        ? "border-green-800 bg-green-900/20 text-green-300" 
                        : "border-red-800 bg-red-900/20 text-red-300"
                    }`}
                  >
                    {statusMessage.type === "success" ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2" />
                    )}
                    <AlertDescription>{statusMessage.message}</AlertDescription>
                  </Alert>
                </motion.div>
              )}

              {step === 1 ? (
                <Form {...phoneForm}>
                  <form
                    onSubmit={phoneForm.handleSubmit(checkPhoneNumber)}
                    className="space-y-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <FormField
                        control={phoneForm.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Your Phone Number
                            </FormLabel>
                    <div className="relative">
                              <FormControl>
                      <Input
                                  placeholder="Enter your 10-digit number"
                        className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                                  {...field}
                                  maxLength={10}
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                />
                              </FormControl>
                              <Phone
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                      />
                    </div>
                            <FormDescription className="text-gray-500 text-xs">
                              We'll use this to identify you
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

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
              ) : (
                <Form {...userInfoForm}>
                  <form
                    onSubmit={userInfoForm.handleSubmit(createNewUser)}
                    className="space-y-6"
                  >
                    {phoneNumber && (
                      <div className="mb-6 p-3 bg-amber-800/10 border border-amber-700/30 rounded-md">
                        <p className="text-sm text-amber-300">
                          <Phone size={14} className="inline mr-2" />
                          Phone: {phoneNumber}
                        </p>
                      </div>
                    )}
                    
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <FormField
                        control={userInfoForm.control}
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
                              This is how we'll address you
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
                        control={userInfoForm.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Date of Birth
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type="date"
                                  placeholder="YYYY-MM-DD"
                                  className="bg-[#1A1A1A] border-[#333] focus:border-amber-600/50 h-12 pl-12 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <Calendar
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/70"
                              />
                            </div>
                            <FormDescription className="text-gray-500 text-xs">
                              Your date of birth helps us personalize your experience
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

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
                              <span>Create Account</span>
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
                          onClick={handleBack}
                          className="w-full border-[#333] text-gray-300 hover:text-white hover:bg-[#1A1A1A] h-12"
                          disabled={isLoading}
                        >
                          Back
                        </Button>
                      </motion.div>
                  </motion.div>
                </form>
                </Form>
              )}
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
