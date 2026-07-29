import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useForgotPasswordMutation,
  useVerifyOtpMutation,
} from "@/modules/auth/auth.hooks";
import { AuthLayout } from "@/components/auth-layout";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";

const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  otp: z
    .string()
    .trim()
    .min(1, "OTP is required")
    .min(6, "OTP must be at least 6 characters"),
});

type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;
type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const forgotPasswordMutation = useForgotPasswordMutation();
  const verifyOtpMutation = useVerifyOtpMutation();

  const requestForm = useForm<RequestOtpFormValues>({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyForm = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const handleRequestOtp = async (data: RequestOtpFormValues) => {
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: data.email,
      });

      if (!response.success) {
        setErrorMessage(
          response.message || "Failed to send OTP. Please try again.",
        );
        return;
      }

      setInfoMessage(
        response.message || "If that email exists, an OTP has been sent.",
      );
      verifyForm.setValue("email", data.email);
      setStep("verify");
    } catch {
      setErrorMessage("Unable to process request. Please try again later.");
    }
  };

  const handleVerifyOtp = async (data: VerifyOtpFormValues) => {
    setErrorMessage(null);

    try {
      const response = await verifyOtpMutation.mutateAsync({
        email: data.email,
        otp: data.otp,
      });

      if (!response.success) {
        setErrorMessage(response.message || "Invalid OTP");
        return;
      }

      const resetToken = response.data?.resetToken;

      if (!resetToken) {
        setErrorMessage("Reset token missing from server response.");
        return;
      }

      navigate("/reset-password", {
        state: { resetToken, email: data.email },
        replace: true,
      });
    } catch {
      setErrorMessage("Invalid OTP or server error. Please try again.");
    }
  };

  const currentEmail =
    step === "request"
      ? requestForm.watch("email")
      : verifyForm.watch("email");

  const title = step === "request" ? "Forgot Password?" : "Verify OTP";
  const subtitle =
    step === "request"
      ? "Enter your email address and we'll send you an OTP to reset your password"
      : `Enter the verification code sent to ${currentEmail}`;

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {infoMessage ? (
        <div className="mb-6 rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {errorMessage}
        </div>
      ) : null}

      {step === "request" ? (
        <form
          onSubmit={requestForm.handleSubmit(handleRequestOtp)}
          className="my-6 space-y-6"
        >
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-normal text-gray-700"
            >
              E-mail address
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...requestForm.register("email")}
                className="h-12 rounded border-gray-200 pl-10 placeholder:text-gray-400"
              />
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            {requestForm.formState.errors.email ? (
              <p className="mt-1.5 text-xs text-red-500">
                {requestForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
          >
            {forgotPasswordMutation.isPending ? "Sending OTP..." : "Send OTP"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={verifyForm.handleSubmit(handleVerifyOtp)}
          className="my-6 space-y-6"
        >
          <div>
            <Label
              htmlFor="email-verify"
              className="text-sm font-normal text-gray-700"
            >
              E-mail address
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="email-verify"
                type="email"
                {...verifyForm.register("email")}
                className="h-12 rounded border-gray-200 pl-10 placeholder:text-gray-400"
              />
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            {verifyForm.formState.errors.email ? (
              <p className="mt-1.5 text-xs text-red-500">
                {verifyForm.formState.errors.email.message}
              </p>
            ) : null}
          </div>

          <div>
            <Label
              htmlFor="otp"
              className="text-sm font-normal text-gray-700"
            >
              Verification OTP
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                {...verifyForm.register("otp")}
                className="h-12 rounded border-gray-200 pl-10 tracking-widest placeholder:tracking-normal placeholder:text-gray-400"
                maxLength={10}
              />
              <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            </div>
            {verifyForm.formState.errors.otp ? (
              <p className="mt-1.5 text-xs text-red-500">
                {verifyForm.formState.errors.otp.message}
              </p>
            ) : null}
          </div>

          <Button
            type="submit"
            disabled={verifyOtpMutation.isPending}
            className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
          >
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setStep("request");
                setErrorMessage(null);
                setInfoMessage(null);
              }}
              className="text-xs text-gray-500 hover:text-blue-600 hover:underline"
            >
              Resend OTP / Change Email
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          to="/sign-in"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
