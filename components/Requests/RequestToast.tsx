import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RequestToast = () => {
  return <ToastContainer />;
};

export const showToast = (
  message: string,
  type: "info" | "success" | "error"
) => {
  switch (type) {
    case "info":
      toast.info(message);
      break;
    case "success":
      toast.success(message);
      break;
    case "error":
      toast.error(message);
      break;
    default:
      toast(message);
  }
};

export default RequestToast;
