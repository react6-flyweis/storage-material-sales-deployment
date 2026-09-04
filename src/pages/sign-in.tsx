import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/modules/auth/auth.hooks";
import { AuthLayout } from "@/components/auth-layout";
import { Eye, EyeOff } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api-error";
import * as Sentry from "@sentry/react";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

const signInSchema = z.object({
  email: z.string().trim().min(1, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      await loginMutation.mutateAsync(data);

      const state = location.state as RedirectState | null;
      const nextPath = state?.from?.pathname || "/dashboard";

      navigate(nextPath, { replace: true });
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        "Unable to sign in. Please try again",
      );
      setError("root", {
        type: "manual",
        message: errorMessage,
      });
      Sentry.captureMessage("Failed sign-in attempt", {
        level: "warning",
        extra: {
          statusCode: 200,
          authProvider: "local",
          email: data.email,
          responseMessage: errorMessage,
        },
      });
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Let's build something great">
      <form onSubmit={handleSubmit(onSubmit)} className="my-6 space-y-6">
        <div>
          <Label htmlFor="email" className="text-sm font-normal text-gray-700">
            E-mail or phone number
          </Label>
          <Input
            id="email"
            type="text"
            placeholder="Enter your email"
            {...register("email")}
            className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
          />
          {errors.email ? (
            <p className="mt-1.5 text-xs text-red-500 font-normal">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div>
          <Label
            htmlFor="password"
            className="text-sm font-normal text-gray-700"
          >
            Password
          </Label>
          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...register("password")}
              className="h-12 rounded border-gray-200 pr-10 placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-xs text-red-500 font-normal">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        {errors.root ? (
          <p className="text-sm text-red-500">{errors.root.message}</p>
        ) : null}

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
        >
          {loginMutation.isPending ? "Signing in..." : "Login"}
        </Button>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
