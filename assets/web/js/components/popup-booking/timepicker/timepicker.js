import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

const Timepicker = ({ onStartTimeSelect, onEndTimeSelect, bookings, configs, configsDate, statusExtraTime, priceExtraTime, priceProduct, startExtraTime, endExtraTime }) => {

  const calculateTimeWithDurationAndRound = (durationMinutes) => {
    const initialTime = new Date();

    const newTime = new Date(initialTime.getTime() + durationMinutes * 60000);

    const hours = newTime.getHours();
    let minutes = newTime.getMinutes();
    const seconds = newTime.getSeconds();

    if (seconds >= 30) {
      minutes += 1;
    }

    minutes = Math.floor(minutes / 30) * 30;

    const roundedTime = new Date(newTime);
    roundedTime.setMinutes(minutes);
    roundedTime.setSeconds(0);

    return roundedTime;
  };

  const formatDate = (dateString) => {
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDayOfWeek = (date) => {
    const daysOfWeek = ["0", "1", "2", "3", "4", "5", "6"];
    return daysOfWeek[date.getDay()];
  };

  const parseTime = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return { hours, minutes, seconds };
  };

  const indexDate = parseInt(getDayOfWeek(new Date(formatDate(configsDate))), 10);

  const TimeStoreManage = configs.store_working_time[indexDate];

  const resultTime = calculateTimeWithDurationAndRound(configs.duration);

  const [startTime, setStartTime] = useState(resultTime);
  const [endTime, setEndTime] = useState(resultTime);

  const [totalPrice, setTotalPrice] = useState(priceProduct);

  const currentTime = new Date();
  const hoursCurrent = currentTime.getHours();
  let minTimeConfigTempHour = 0;
  let minTimeConfigTempminutes = 0;

  if ((hoursCurrent > parseTime(TimeStoreManage.open_at).hours) && (formatDate(currentTime) === formatDate(configsDate))) {
    minTimeConfigTempHour = startTime.getHours();
    minTimeConfigTempminutes = startTime.getMinutes();
  } else {
    minTimeConfigTempHour = parseTime(TimeStoreManage.open_at).hours;
  }

  const minTime = new Date();
  minTime.setHours(minTimeConfigTempHour, minTimeConfigTempminutes, 0);

  const maxTime = new Date();
  
  if(statusExtraTime == true){
    maxTime.setHours(parseTime(endExtraTime).hours, parseTime(endExtraTime).minutes, 0);
  }else{
    maxTime.setHours(parseTime(TimeStoreManage.close_at).hours, parseTime(TimeStoreManage.close_at).minutes, 0);
  } 

  const calculatePrice = (start, end, price) => {
    const diff = Math.abs(end - start);
  
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.round((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    let finalPrice = 0;
    finalPrice = (hours+ minutes/60) * price;

    return finalPrice;
    
  };
  

  const handleStartTimeChange = (time) => {
    setStartTime(time);
    onStartTimeSelect(time);
    // const [startExtraTimeHours, startExtraTimeMinutes] = startExtraTime.split(":");
    
    // if(statusExtraTime != true){
    //   setTotalPrice(calculatePrice(time, endTime , priceProduct));
    // }
    // else{
    //   if((startTime.getHours()) >= startExtraTimeHours){
    //     setTotalPrice(calculatePrice(time, endTime , priceExtraTime));
    //   }else{
    //     let finalTotalPrice = (((startExtraTimeHours - time.getHours()) + ((startExtraTimeMinutes)- time.getMinutes())/60) * priceProduct) +  (((endTime.getHours() - startExtraTimeHours) + (endTime.getMinutes() - startExtraTimeMinutes)) * priceExtraTime);
    //     setTotalPrice(finalTotalPrice);
    //   }
    // }
  };

  const handleEndTimeChange = (time) => {
    setEndTime(time);
    onEndTimeSelect(time);

    const [startExtraTimeHours, startExtraTimeMinutes] = startExtraTime.split(":");
    
    if(statusExtraTime != true){
      setTotalPrice(calculatePrice(startTime, time , priceProduct));
    }
    else{
      if((startTime.getHours()) >= startExtraTimeHours){
        setTotalPrice(calculatePrice(startTime, time , priceExtraTime));
      }else{
        let finalTotalPrice = (((startExtraTimeHours - startTime.getHours()) + ((startExtraTimeMinutes)- startTime.getMinutes())/60) * priceProduct) +  (((time.getHours() - startExtraTimeHours) + (time.getMinutes() - startExtraTimeMinutes)) * priceExtraTime);
        setTotalPrice(finalTotalPrice);
      }
    }
  };

  const disabledTimeRanges = bookings.map((booking) => ({
    start: booking.booking_start_time,
    end: booking.booking_end_time,
  }));

  const filteredTimeRanges = disabledTimeRanges.filter(
    (range) => range.start !== range.end
  );

  const isTimeDisabled = (time) => {
    const timeString = time.toTimeString().split(' ')[0];
    return !filteredTimeRanges.some(
      (range) => timeString >= range.start && timeString <= range.end
    );
  };


  return (
    <div className="row-booking">
      <div className="col_booking_time">
        <h6>Begin Time:</h6>
        <DatePicker
          selected={startTime}
          onChange={handleStartTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={configs.duration}
          timeCaption="Start Time"
          dateFormat="h:mm aa"
          filterTime={isTimeDisabled}
          minTime={minTime}
          maxTime={maxTime}
        />
      </div>
      <div className="col_booking_time">
        <h6>End Time:</h6>
        <DatePicker
          selected={endTime}
          onChange={handleEndTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={configs.duration}
          timeCaption="End Time"
          dateFormat="h:mm aa"
          filterTime={isTimeDisabled}
          minTime={startTime}
          maxTime={maxTime}
        />
      </div>
      <div className="col_booking_time_price">
        <div className="col_booking_time_price_row">
          <p><span>Total:</span> ${totalPrice}</p> 
        </div>
      </div>
    </div>
  );
};

export default Timepicker;
