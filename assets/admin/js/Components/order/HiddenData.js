import React from "react";
import { useOrderProvider } from "../../providers/OrderProvider";
import { format } from "date-fns";
import { convertTime24to12 } from "../../utils/dateHelper";

const HiddenData = () => {
  const { selectedDate, selectedOutlet, selectedTime, selectedMode } = useOrderProvider();
  const renderTimeSlot = (time) => {
    return convertTime24to12(time.from) + " to " + convertTime24to12(time.to)
  }
  return (
    <div>
      <input type="hidden" id="custom_billing_meta_data" name="custom_billing_meta_data" value={1} />
      <input type="hidden" id="_billing_date" name="_billing_date" value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} />
      <input type="hidden" id="_billing_time" name="_billing_time" value={!!selectedTime ? renderTimeSlot(selectedTime) : ''} />
      <input type="hidden" id="_billing_method_shipping" name="_billing_method_shipping" value={selectedMode ?? ''} />
      <input type="hidden" id="_billing_outlet" name="_billing_outlet" value={selectedOutlet?.outlet_name ?? ''} />
      <input type="hidden" id="_billing_outlet_address" name="_billing_outlet_address" value={selectedOutlet?.outlet_address?.address ?? ''} />
    </div>
  );
};

export default HiddenData;
