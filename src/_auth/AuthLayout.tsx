import { Outlet, Navigate } from "react-router-dom";

const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-dark-1">
          <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-0 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

          <div className="relative z-10 w-full max-w-md px-6 sm:px-8">
            <div className="rounded-3xl border border-dark-4/70 bg-dark-2/80 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <div className="px-6 py-8 sm:px-10 sm:py-12">
                <Outlet />
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default AuthLayout;
