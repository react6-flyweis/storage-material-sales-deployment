import authBg from "@/assets/images/auth-bg.jpg";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${authBg})` }}
      >
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Auth Form Card */}
      <div className="py-10">
        <div className="relative z-10 w-full max-w-lg rounded-lg bg-white px-12 py-10 shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
            ) : null}
          </div>

          {children}
        </div></div>
    </div>
  );
}

export default AuthLayout;
