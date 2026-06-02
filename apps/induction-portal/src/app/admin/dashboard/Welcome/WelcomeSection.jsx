export default function WelcomeSection({userType=""}) {
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-400">
        Welcome back,
      </p>

      <h1 className="mt-1 text-xl sm:text-2xl md:text-3xl font-bold text-white">
        {userType} Dashboard
      </h1>
    </div>
  );
}