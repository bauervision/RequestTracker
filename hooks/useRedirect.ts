import { useRouter } from "next/router";
import { useEffect } from "react";

const useRedirect = (condition: boolean, path: string) => {
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      if (router.isReady && condition) {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Delay for 500ms
        router.replace(path);
      }
    };
    redirect();
  }, [router, condition, path]);
};

export default useRedirect;
