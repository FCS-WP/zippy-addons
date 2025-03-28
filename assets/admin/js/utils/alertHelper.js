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

