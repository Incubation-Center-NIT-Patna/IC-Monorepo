export default function WelcomeSection({userType=""}) {
  return (
    <div>
      <p className="text-xs sm:text-sm text-gray-400">
        Welcome back,
      </p>

      <h1 className="mt-1 text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
        {userType} Dashboard
      </h1>
    </div>
  );
}