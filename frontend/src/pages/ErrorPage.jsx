import { useRouteError } from "react-router-dom";
import Button from "../components/UI/Button";
import { ROUTES } from "../constants/routes";

export default function ErrorPage() {
  let error = null;

  try {
    error = useRouteError();
  } catch (hookError) {
    console.warn("useRouteError not available, using fallback error handling");
    error = { message: "An unexpected error occurred" };
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
      <div className="max-w-md space-y-4">
        <h1 className="text-5xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-xl text-gray-700">Something went wrong</p>
        <p className="text-gray-500 mb-8">
          <i>{error?.statusText || error?.message || "Unknown error"}</i>
        </p>
        <div className="flex justify-center">
          <Button as="a" href={ROUTES.HOME} className="px-6 py-3">
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
