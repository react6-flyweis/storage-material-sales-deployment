import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/modules/auth/auth.hooks";
import authBg from "@/assets/images/auth-bg.jpg";
import { Eye, EyeOff } from "lucide-react";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const loginMutation = useLoginMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await loginMutation.mutateAsync(formData);

      if (!response.success) {
        setErrorMessage(response.message || "Login failed. Please try again.");
        return;
      }

      const state = location.state as RedirectState | null;
      const nextPath = state?.from?.pathname || "/dashboard";

      navigate(nextPath, { replace: true });
    } catch {
      setErrorMessage("Unable to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Sign In Form */}
      <div className="relative z-10 w-full max-w-lg rounded-lg bg-white px-12 py-10 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sign In</h1>
          <p className="mt-2 text-sm text-gray-500">
            Let's build something great
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label
              htmlFor="email"
              className="text-sm font-normal text-gray-700"
            >
              E-mail or phone number
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1.5 h-12 rounded border-gray-200 placeholder:text-gray-400"
              required
            />
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="h-12 rounded border-gray-200 pr-10 placeholder:text-gray-400"
                required
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
          </div>

          {errorMessage ? (
            <p className="text-sm text-red-500">{errorMessage}</p>
          ) : null}

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="h-12 w-full bg-blue-500 text-base font-medium hover:bg-blue-600"
          >
            {loginMutation.isPending ? "Signing in..." : "Login"}
          </Button>

          <div className="text-center">
            <a
              href="#"
              className="text-sm text-blue-500 hover:text-blue-600 hover:underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
