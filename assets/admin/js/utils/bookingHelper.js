import { toast } from "react-toastify";
import { Api } from "../api";
import Swal from "sweetalert2";
import theme from "../../theme/theme";

export const callDeleteMappingItems = async (ids) => {
  try {
    const params = {
      request: ids,
    };
    const { data } = await Api.deleteMappingItems(params);
    if (!data || data.status != "success") {
      toast.error("Delete failed!");
    } else {
      toast.success("Delete Successfully!");
    }
  } catch (error) {
    toast.error("Delete failed!");
  }
};

export const deleteConfirm = async () => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });
  return confirm.isConfirmed;
};

export const alertConfirm = async (title, text, confirmText) => {
  const confirm = await Swal.fire({
    title: title,
    text: text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmText,
  });
  return confirm.isConfirmed;
};

export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !regex.test(email)) {
    return false;
  }
  return true;
}

export const getEventColors = (status) => {
  let result =  ``;
  switch (status) {
    case 'pending':
      result = theme.palette.primary.pending;
      break;
    case 'approved':
      result = theme.palette.primary.approved;
      break;
    case 'completed':
      result = theme.palette.primary.complete;
      break;
    case 'cancelled':
      result = theme.palette.primary.cancelled;
      break;
    default:
      result = theme.palette.primary.pending;
      break;
  }

  return result;
}