import Swal from "sweetalert2";
export const AlertStatus = {
    success: 'success',
    error: 'error',
    warning: 'warning'
}

export const showAlert = async (status, title, text, timer = 3000) => {
    Swal.fire({
      icon: status,
      title,
      text,
      timer: 3000,
      showConfirmButton: false,
    });
  };

export const alertConfirmDelete = async () => {
 const confirmed = Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  }).then((result) => {
    if (result.isConfirmed) {
      return true;
    } else{
      return false;
    }
  });
  return confirmed;
}