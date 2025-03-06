import React, { useEffect, useState } from "react";
import Timepicker from "./components/popup-booking/timepicker/timepicker";
import Prebooking from "./components/popup-booking/pre-booking/prebooking";
import BookingDatePicker from "./components/BookingDatePicker";
import { webApi } from "./api";
import {
  alertInputEmail,
  showAlert,
  bookingSuccessfully,
} from "./helper/showAlert";
import CustomLoader from "./components/CustomLoader";
import { Modal, Box } from "@mui/material";
import { format } from "date-fns";
import Login from "./components/Login";
import Register from "./components/Register";

function BookingPopUp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [configsDate, setConfigsDate] = useState([new Date()]);
  const [isLoading, setIsLoading] = useState(false);
  const [priceProduct, setPriceProduct] = useState("0");
  const [priceExtraTime, setExtraTime] = useState("0");
  const [isBookingVisible, setIsBookingVisible] = useState(false);
  const [statusExtraTime, setStatusExtraTime] = useState(false);
  const [startExtraTime, setStartExtraTime] = useState("");
  const [endExtraTime, setEndExtraTime] = useState("");
  const [switchStatus, setSwitchStatus] = useState("");
  const [configFull, setConfigFull] = useState("");
  const [modalType, setModalType] = useState(null); // "login", "register", "booking"

  const productid = document.getElementById("btn_booking")?.dataset.idProduct;
  const [productId, setProductId] = useState(productid);
  
  const getConfig = async () => {
    try {
      const configResponse = await webApi.getConfigs();
      setConfigFull(configResponse);
      setConfigs(configResponse.data.data || []);
    } catch (err) {
      showAlert(
        "error",
        "Get Config Failed",
        err.message || "An unknown error occurred."
      );
    }
  };

  useEffect(() => {
    setProductId(productid);
    getConfig();
    checkMappingProduct();
  }, [productid]);

  const handleOpenModal = (type) => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setConfigsDate(date);
  };

  const handleStartTimeSelect = (time) => {
    setSelectedStartTime(time);
  };

  const handleEndTimeSelect = (time) => {
    setSelectedEndTime(time);
  };

  const checkMappingProduct = async () => {
    try {
      const response = await webApi.mappingProduct({ product_id: productId });
      setIsBookingVisible(response.data.data.booking === true);
    } catch (error) {
      console.error("Error fetching mapping product:", error);
      setIsBookingVisible(false);
    }
  };

  const createBooking = async () => {
    setIsLoading(true);

    try {
      if (!productId || !selectedDate || !selectedStartTime || !selectedEndTime) {
        showAlert("warning", "Missing data", "Please select complete booking information.");
        return;
      }

      let email = admin_data.user_email || (await alertInputEmail());
      if (!email) {
        showAlert("warning", "Cancel", "You have not entered a valid email.");
        return;
      }

      const params = {
        product_id: productId,
        user_id: admin_data.userID,
        email,
        booking_start_date: format(selectedDate, "yyyy-MM-dd"),
        booking_end_date: format(selectedDate, "yyyy-MM-dd"),
        booking_start_time: format(selectedStartTime, "HH:mm"),
        booking_end_time: format(selectedEndTime, "HH:mm"),
      };

      const response = await webApi.createBooking(params);

      if (response.data?.status === "success") {
        bookingSuccessfully(() => (window.location.href = "/booking-history"));
      } else {
        showAlert("error", "Booking error", response.data?.message || "An error occurred.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showAlert("error", "Booking error", err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const getAllBooking = async () => {
    try {
      const params = {
        product_id: productId,
        booking_start_date: format(selectedDate, "yyyy-MM-dd"),
        booking_end_date: format(selectedDate, "yyyy-MM-dd"),
      };
      const bookingsResponse = await webApi.getBookings(params);
      setBookings(bookingsResponse.data.data.bookings || []);

      const getDayOfWeek = (date) => {
        const daysOfWeek = ["0", "1", "2", "3", "4", "5", "6"];
        return daysOfWeek[date.getDay()];
      };
    
      
      const indexDate = parseInt(getDayOfWeek(new Date(format(selectedDate, "yyyy-MM-dd"))));
      const configResponse = await webApi.getConfigs();
      let extraTime = configResponse.data.data.store_working_time;

      if(extraTime[indexDate].extra_time.is_active == 'T'){
        setStatusExtraTime(true);
        const responseMapping = await webApi.mappingProduct(params);
        
        const mappingInfor = responseMapping.data.data;
        if(mappingInfor.sale_price == null){
          setPriceProduct(mappingInfor.regular_price);
        }else{
          setPriceProduct(mappingInfor.sale_price);
        }
        setExtraTime(mappingInfor.extra_price);
        setStartExtraTime(extraTime[indexDate].extra_time.data[0].from);
        setEndExtraTime(extraTime[indexDate].extra_time.data[0].to);

      }else{
        setStatusExtraTime(false);
      }

      
      
    } catch (err) {
      showAlert(
        "error",
        "Get Booking Failed",
        err.message || "An unknown error occurred."
      );
    }
  };

  useEffect(() => {
    if (productId && selectedDate) {
      getAllBooking();
    }
    if(switchStatus == "register"){
      handleOpenModal("register");
    }
    else if(switchStatus == "login"){
      handleOpenModal("login");
    }
    
  }, [selectedDate, productId, switchStatus]);

  
  

  return (
    <>
      {isBookingVisible && (
        <button className="booking_popup_form" onClick={() => handleOpenModal(admin_data.userID == 0 ? "login" : "booking")}>
          Booking
        </button>
      )}
      
      <Modal className="zippy-booking-popup" open={modalType === "register"} onClose={handleCloseModal}>
        <Register onSuccess={handleCloseModal} onSwitch={setSwitchStatus}/>
      </Modal>
      
      <Modal className="zippy-booking-popup" open={modalType === "login"} onClose={handleCloseModal}>
        <Login onSuccess={handleCloseModal} onSwitch={setSwitchStatus}/>
      </Modal>

      
      <Modal className="zippy-booking-popup" open={modalType === "booking"} onClose={handleCloseModal}>
        <Box>
          <div className="box_pop_up">
            <div className="box_pop_up--content">
              <h2>Booking Form</h2>
              <p>Select a time for Pottery Painting Session</p>
              <p>
                Do note that the studio fee ($28 per person, collected during
                booking of session as a deposit) excludes the price of chosen
                ceramic piece. The studio fee is inclusive of studio and tools
                usage and pottery processing (firing done by Pottery Please)
              </p>
              <div className="row_booking">
                <div className="col_booking_5">
                  <BookingDatePicker handleSelectDate={handleSelectDate} config={configs} />
                </div>
                <div className="col_booking_5">
                  <Timepicker
                    onStartTimeSelect={handleStartTimeSelect}
                    onEndTimeSelect={handleEndTimeSelect}
                    bookings={bookings}
                    configs={configs}
                    configsDate={configsDate}
                    statusExtraTime={statusExtraTime}
                    priceProduct={priceProduct}
                    priceExtraTime={priceExtraTime}
                    startExtraTime={startExtraTime}
                    endExtraTime={endExtraTime}
                  />
                  <Prebooking bookings={bookings} />
                  {isLoading && <CustomLoader />}
                </div>
              </div>
              <div className="flex-space-between">
                <button className="cancel_popup_button" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="continute_popup_button" onClick={createBooking} disabled={isLoading}>
                  Confirm Booking
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}

export default BookingPopUp;