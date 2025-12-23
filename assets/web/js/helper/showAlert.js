import Swal from "sweetalert2";

export const showAlert = async (status, title, text, timer = 3000) => {
  Swal.fire({
    icon: status,
    title,
    text,
    timer: 3000,
    showConfirmButton: false,
  });
};

export const bookingSuccessfully = (handleConfirm) => {
  Swal.fire({
    customClass: "booking_success",
    title: "Booking Successful",
    text: "Your booking has been created successfully!",
    icon: "success",
    showCancelButton: true,
    confirmButtonText: "View Booking",
    cancelButtonText: "Cancel",
    timer: 0,
  }).then((result) => {
    handleConfirm(result);
  });
};

export const alertInputEmail = async () => {
  const { value: email } = await Swal.fire({
    title: "EMAIL ADDRESS ",
    input: "email",
    inputPlaceholder: "Enter your email address",
    showCancelButton: true,
    confirmButtonText: "Continue",
    focusConfirm: true,
    customClass: {
      input: "swal-input-email",
      confirmButton: "swal-confirm-btn",
    },
    inputValidator: (email) => {
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!email || !regex.test(email)) {
        return "Please enter a valid email address!";
      }
    },
  });
  if (email) {
    return email;
  }
  return null;
};

// Helper
export const productPricingRule = async ({ handleConfirm, date, price }) => {
  const result = await Swal.fire({
    customClass: "product_pricing",
    title: `Price adjustment to ${price}`,
    html: `From ${date.from} to ${date.to} <br />Continue to order?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "Back to Menu",
    timer: 0,
  });

  if (handleConfirm) {
    handleConfirm(result);
  }

  return result;
};
