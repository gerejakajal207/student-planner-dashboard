export default function SignUp() {
  return (
    <div>
      <div className="container flex h-screen">
        {/* <!-- Left --> */}
        <div className="left flex w-3/5 flex-col items-center bg-blue-50">
          {/* <!-- Logo --> */}
          <header className="flex h-20 w-full items-center px-8">
            <img src="logo" alt="logo" className="h-10" />
          </header>

          {/* <!-- Title --> */}
          <h1 className="mb-2 font-serif text-3xl font-bold">Sign up to FocusNest</h1>
          <p className="mb-6 text-center font-serif text-gray-600">
            Organize your tasks, boost your focus, and reach your goals faster.
          </p>

          {/* <!-- Form --> */}
          <form className="w-2/4 space-y-4">
            {/* <!-- Name --> */}
            <div>
              <label className="mb-1 block font-semibold text-blue-700">Name</label>
              <input
                type="text"
                required
                placeholder="eg. John Doe"
                className="w-full rounded-lg border border-blue-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <!-- Email --> */}
            <div>
              <label className="mb-1 block font-semibold text-blue-700">Email</label>
              <input
                type="email"
                required
                placeholder="eg. a@bc.com"
                className="w-full rounded-lg border border-blue-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <!-- Password --> */}
            <div>
              <label className="mb-1 block font-semibold text-blue-700">Password</label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full rounded-lg border border-blue-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* <!-- Confirmation --> */}
            <div>
              <label className="mb-1 block font-semibold text-blue-700">Confirmation</label>
              <input
                type="password"
                required
                minlength="8"
                placeholder="Enter same as above"
                className="w-full rounded-lg border border-blue-400 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <!-- Button --> */}
            <button
              type="submit"
              className="w-full rounded-lg bg-[#4a90e2] py-3 font-semibold text-white transition hover:bg-blue-600"
            >
              Continue to Sign in
            </button>

            {/* <!-- terms and condition --> */}
            <p className="mt-2 text-center text-xs text-gray-500">
              By signing in, you agree to our
              <span className="cursor-pointer underline hover:text-blue-800">privacy policy</span>
              and
              <span className="cursor-pointer underline hover:text-blue-800">terms of use</span>
            </p>
          </form>
        </div>

        {/* <!-- Right --> */}
        <div className="right w-2/5 bg-white"></div>
      </div>
    </div>
  );
}
