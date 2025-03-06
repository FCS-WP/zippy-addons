import React, { useEffect, useState } from "react";
import BookingStep1 from "./components/single-booking/BookingStep1";
import BookingStep2 from "./components/single-booking/BookingStep2";
import BookingStep3 from "./components/single-booking/BookingStep3";
import { webApi } from "./api";
import { toast, ToastContainer } from "react-toastify";
import Message from "./components/single-booking/Message";

const BookingForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bookingData, setBookingData] = useState();
  const [pluginConfigs, setPluginConfigs] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };

  const getPluginConfigs = async () => {
    try {
      setIsLoading(true);
      const response = await webApi.getConfigs();
      if (response?.data?.status === "success") {
        const config = response.data.data;
        setPluginConfigs(config);
      } else {
        toast.error("Failed to fetch booking configurations.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching configurations.");
    } finally {
      setIsLoading(false);
    }
  };

  const STEP_LABELS = {
    1: "Select Field",
    2: "Select Date",
    3: "Review",
  };

  const handleNextStep = (currentStep, data) => {
    switch (currentStep) {
      case 1:
        setSelectedProduct(data);
        setCurrentStep(2);
        break;
      case 2:
        setBookingData(data);
        setCurrentStep(3);
        break;
      case 3:
        setCurrentStep(1);
        setSelectedProduct(null);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getPluginConfigs();
  }, []);

  if (isLoading) {
    return <Message message="Loading booking configurations..." />;
  }
  return (
    <>
      {pluginConfigs ? (
        <div id="zippy-booking-form">
          <div className="steps-container">
            {Object.keys(STEP_LABELS).map((step) => (
              <div
                key={step}
                className={`step-item ${currentStep == step ? "active" : ""}`}
              >
                <span></span>
                <h4>{`${step}. ${STEP_LABELS[step]}`}</h4>
              </div>
            ))}
          </div>
          <div className="booking-container">
            {currentStep == 1 && (
              <BookingStep1 handleNextStep={handleNextStep} />
            )}

            {currentStep == 2 && (
              <BookingStep2
                handlePreviousStep={handlePreviousStep}
                handleNextStep={handleNextStep}
                selectedProduct={selectedProduct}
                configs={pluginConfigs}
              />
            )}

            {currentStep == 3 && (
              <BookingStep3
                selectedProduct={selectedProduct}
                bookingData={bookingData}
                handleNextStep={handleNextStep}
              />
            )}
          </div>
          <ToastContainer />
        </div>
      ) : (
        <Message message={"Can not get booking configs."} />
      )}
    </>
  );
};

export default BookingForm;


