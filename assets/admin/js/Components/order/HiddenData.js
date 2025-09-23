import React from "react";
import { useOrderProvider } from "../../providers/OrderProvider";
import { format } from "date-fns";
import { formatMetersToKm } from "../../utils/bookingHelper";

const HiddenData = () => {
  const {
    selectedDate,
    selectedOutlet,
    selectedTime,
    selectedMode,
    deliveryDistance,
    selectedLocation,
  } = useOrderProvider();
  const renderTimeSlot = (time) => {
    return `From ${time.from} to ${time.to}`;
  };

  return (
    <div>
      <input
        type="hidden"
        id="custom_billing_meta_data"
        name="custom_billing_meta_data"
        value={1}
      />
      <input
        type="hidden"
        id="is_manual_order"
        name="is_manual_order"
        value="yes"
      />
      <input
        type="hidden"
        id="_billing_date"
        name="_billing_date"
        value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
      />
      <input
        type="hidden"
        id="_billing_time"
        name="_billing_time"
        value={!!selectedTime ? renderTimeSlot(selectedTime) : ""}
      />
      {selectedMode == "delivery" && (
        <>
          <input
            type="hidden"
            id="_billing_delivery_to"
            name="_billing_delivery_to"
            value={!!selectedLocation ? selectedLocation.ADDRESS : ""}
          />
          <input
            type="hidden"
            id="_billing_delivery_postal"
            name="_billing_delivery_postal"
            value={!!selectedLocation ? selectedLocation.POSTAL : ""}
          />
          <input
            type="hidden"
            id="_billing_distance"
            name="_billing_distance"
            value={!!deliveryDistance ? deliveryDistance : ""}
          />
        </>
      )}
      <input
        type="hidden"
        id="_billing_method_shipping"
        name="_billing_method_shipping"
        value={selectedMode ?? ""}
      />
      <input
        type="hidden"
        id="_billing_outlet"
        name="_billing_outlet"
        value={selectedOutlet?.outlet_name ?? ""}
      />
      <input
        type="hidden"
        id="_billing_outlet_address"
        name="_billing_outlet_address"
        value={selectedOutlet?.outlet_address?.address ?? ""}
      />
    </div>
  );
};

export default HiddenData;
