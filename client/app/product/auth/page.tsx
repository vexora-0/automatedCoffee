"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/lib/api/services";
import { motion, AnimatePresence } from "framer-motion";
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
  ChevronLeft,
  ArrowRight,
  Phone,
  Check,
  AlertCircle,
  Calendar,
  Coffee,
  CupSoda,
  Smile,
  Heart,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";

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
  date_of_birth: z.string().refine(
    (val) => {
      // Check if the date is valid and not in the future
      const date = new Date(val);
      const today = new Date();
      return !isNaN(date.getTime()) && date <= today;
    },
    {
      message: "Please enter a valid date of birth.",
    }
  ),
});

// Greeting messages for new users
const NEW_USER_GREETINGS = [
  "Looks like you're new here! Let's get to know you better.",
  "First time? We'd love to know a bit about you!",
  "Welcome to Froth Filter! Let's set up your profile.",
  "Hey there! Seems like you're new. Tell us about yourself!",
  "New coffee enthusiast? Let's personalize your experience!",
];

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
  const [newUserGreeting, setNewUserGreeting] = useState("");
  const [animatePhone, setAnimatePhone] = useState(false);

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

    // Set random greeting for new users
    const randomIndex = Math.floor(Math.random() * NEW_USER_GREETINGS.length);
    setNewUserGreeting(NEW_USER_GREETINGS[randomIndex]);
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
    setAnimatePhone(true);

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
          }, 1500);
        } else {
          // New user - proceed to collect name
          setPhoneNumber(values.phone_number);
          setTimeout(() => {
            setStep(2);
            // Reset userInfoForm
            userInfoForm.reset({
              name: "",
              date_of_birth: "",
            });
          }, 500);
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
      setTimeout(() => setAnimatePhone(false), 1000);
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
        }, 1500);
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
      <div className="min-h-screen bg-[#F4EBDE] flex flex-col items-center justify-center">
        <div className="w-full max-w-md p-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-[#5F3023]">WELCOME</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4EBDE] to-[#DAB49D]/50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Coffee bean shapes floating in background */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#8A5738]/5"
            style={{
              width: Math.random() * 120 + 80 + "px",
              height: Math.random() * 120 + 80 + "px",
              borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            }}
            animate={{
              x: [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
              ],
              y: [
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
                Math.random() * 20 - 10,
              ],
              rotate: [0, Math.random() * 10 - 5],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 7,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.4,
            }}
          />
        ))}

        {/* Subtle gradient overlays */}
        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#F4EBDE] to-transparent"></div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#F4EBDE] to-transparent"></div>
      </div>

      {/* Header - Back Link */}
      <motion.button
        className="absolute top-8 left-8 z-10 flex items-center text-[#8A5738] hover:text-[#5F3023] transition-colors bg-transparent border-0"
        whileHover={{ x: -3 }}
        onClick={handleBack}
      >
        <ChevronLeft size={20} />
        <span className="ml-1 text-sm">Back</span>
      </motion.button>

      {/* Logo at top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center z-10"
      >
        <div className="relative w-32 h-12">
          <Image
            src="/brownlogo.svg"
            alt="Froth Filter Logo"
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md px-6 mt-8"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(194,134,84,0.3)] border border-[#DAB49D]">
            {/* Card header with icon */}
            <div className="relative px-8 pt-10 pb-8 border-b border-[#DAB49D]/50 overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C28654]/5 rounded-full transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#8A5738]/5 rounded-full transform -translate-x-8 translate-y-8"></div>

              <div className="flex justify-center mb-6 relative">
                <motion.div
                  animate={
                    animatePhone
                      ? {
                          scale: [1, 1.2, 0.8, 1],
                          rotate: [0, -10, 10, 0],
                        }
                      : {}
                  }
                  transition={{ duration: 0.6 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#C28654]/30 to-[#8A5738]/20 flex items-center justify-center shadow-lg relative overflow-hidden"
                >
                  {step === 1 ? (
                    <Phone size={36} className="text-[#8A5738]" />
                  ) : (
                    <User size={36} className="text-[#8A5738]" />
                  )}

                  {/* Animated rings */}
                  <motion.div
                    className="absolute inset-0 border-2 border-[#C28654]/20 rounded-2xl"
                    animate={{ scale: [1, 1.2, 1.4], opacity: [1, 0.5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                  />
                </motion.div>
              </div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-2xl font-bold text-[#5F3023] text-center"
              >
                {step === 1 ? "WELCOME" : "ALMOST THERE!"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-[#8A5738] text-center mt-2"
              >
                {step === 1
                  ? "Enter your phone number to continue"
                  : newUserGreeting}
              </motion.p>
            </div>

            <div className="p-8">
              {/* Status Message */}
              <AnimatePresence>
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6"
                  >
                    <Alert
                      variant={
                        statusMessage.type === "success"
                          ? "default"
                          : "destructive"
                      }
                      className={`border ${
                        statusMessage.type === "success"
                          ? "border-green-800/30 bg-green-50 text-green-800"
                          : "border-red-800/30 bg-red-50 text-red-800"
                      }`}
                    >
                      {statusMessage.type === "success" ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 mr-2" />
                      )}
                      <AlertDescription>
                        {statusMessage.message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Phone number form */}
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
                            <FormLabel className="text-[#5F3023] font-medium">
                              Your Phone Number
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="Enter your 10-digit number"
                                  className="bg-white/80 border-[#DAB49D] focus:border-[#C28654] focus:ring-[#C28654]/30 h-14 pl-14 text-[#5F3023] text-lg rounded-xl shadow-sm"
                                  {...field}
                                  maxLength={10}
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                />
                              </FormControl>
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#C28654]/20 flex items-center justify-center">
                                <Phone size={14} className="text-[#8A5738]" />
                              </div>
                            </div>
                            <FormDescription className="text-[#8A5738]/70 text-xs mt-2">
                              We&apos;ll use this to identify you
                            </FormDescription>
                            <FormMessage className="text-red-600 text-xs mt-1" />
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
                          className={`w-full h-14 text-base font-medium rounded-xl ${
                            isLoading
                              ? "bg-[#C28654]/50 text-white"
                              : "bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
                          }`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
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
                          className="w-full border-[#DAB49D] text-[#8A5738] hover:text-[#5F3023] hover:bg-[#F4EBDE] h-12 rounded-xl"
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
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 bg-[#C28654]/10 border border-[#C28654]/30 rounded-xl flex items-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#C28654]/20 flex items-center justify-center mr-3">
                          <Phone size={14} className="text-[#8A5738]" />
                        </div>
                        <div>
                          <p className="text-xs text-[#8A5738]/70">
                            Phone Number
                          </p>
                          <p className="text-sm text-[#5F3023] font-medium">
                            {phoneNumber}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Name field */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <FormField
                        control={userInfoForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5F3023] font-medium">
                              Your Name
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  className="bg-white/80 border-[#DAB49D] focus:border-[#C28654] focus:ring-[#C28654]/30 h-14 pl-14 text-[#5F3023] text-lg rounded-xl shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#C28654]/20 flex items-center justify-center">
                                <User size={14} className="text-[#8A5738]" />
                              </div>
                            </div>
                            <FormDescription className="text-[#8A5738]/70 text-xs mt-2">
                              This is how we&apos;ll address you
                            </FormDescription>
                            <FormMessage className="text-red-600 text-xs mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Date of birth field */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <FormField
                        control={userInfoForm.control}
                        name="date_of_birth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[#5F3023] font-medium">
                              Date of Birth
                            </FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  type="date"
                                  className="bg-white/80 border-[#DAB49D] focus:border-[#C28654] focus:ring-[#C28654]/30 h-14 pl-14 text-[#5F3023] text-lg rounded-xl shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#C28654]/20 flex items-center justify-center">
                                <Calendar
                                  size={14}
                                  className="text-[#8A5738]"
                                />
                              </div>
                            </div>
                            <FormDescription className="text-[#8A5738]/70 text-xs mt-2">
                              For age verification and special offers
                            </FormDescription>
                            <FormMessage className="text-red-600 text-xs mt-1" />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                      className="flex flex-col space-y-3 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          type="submit"
                          className={`w-full h-14 text-base font-medium rounded-xl ${
                            isLoading
                              ? "bg-[#C28654]/50 text-white"
                              : "bg-gradient-to-r from-[#8A5738] to-[#5F3023] hover:from-[#C28654] hover:to-[#8A5738] text-white"
                          }`}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center">
                              <Loader2 className="mr-2 h-5 w-5 animate-spin text-white" />
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
                          onClick={() => {
                            setStep(1);
                            setStatusMessage(null);
                          }}
                          className="w-full border-[#DAB49D] text-[#8A5738] hover:text-[#5F3023] hover:bg-[#F4EBDE] h-12 rounded-xl"
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
          </div>

          {/* Decorative elements at bottom */}
          <div className="mt-8 flex justify-center">
            <motion.div
              className="flex space-x-3 text-[#8A5738]/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {step === 1 ? (
                <>
                  <Coffee size={16} />
                  <CupSoda size={16} />
                  <Heart size={16} />
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <Coffee size={16} />
                  <Smile size={16} />
                </>
              )}
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating coffee beans */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              y: Math.random() * 100 + 100,
              x: Math.random() * window.innerWidth,
              rotate: Math.random() * 180,
              opacity: 0,
            }}
            animate={{
              y: -100,
              opacity: [0, 0.2, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              delay: Math.random() * 5,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="absolute w-4 h-8 bg-[#5F3023]/10 rounded-full transform rotate-45"
            style={{
              left: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
