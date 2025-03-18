// hooks/useFetchWithToast.ts

import { useToast } from "@/app/context/DataContext";

export const useFetchWithToast = () => {
  const { addToast, updateToast } = useToast();

  const fetchWithToast = async (endpoint: string, options?: RequestInit) => {
    // Display initial toast
    const toastId = addToast({
      title: "Saving request...",
      description: "Please wait while we update your data.",
      variant: "default",
    });

    try {
      if (endpoint === "test") {
        // Simulate a delay for testing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Return dummy data
        const dummyData = {
          message: "This is some dummy data for testing purposes.",
        };

        // Update toast on success
        updateToast(toastId, {
          title: "Save Success!",
          description: "Your data has been successfully saved.",
          variant: "success",
        });

        return dummyData;
      }

      // Fetch data from endpoint
      const response = await fetch(endpoint, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Fetching data failed");
      }

      // Update toast on success
      updateToast(toastId, {
        title: "Data fetched successfully!",
        description: "Your data has been successfully fetched.",
        variant: "success",
      });

      return data;
    } catch (error: any) {
      // Update toast on error
      updateToast(toastId, {
        title: "Error fetching data",
        description: error.message || "Fetching data failed",
        variant: "destructive",
      });

      throw error;
    }
  };

  return { fetchWithToast };
};
