import React from 'react';

function Prebooking({ bookings }) {
    return (
        <div>
            <h6>Pre-order Schedule</h6>

            {bookings.length > 0 ? (
                <div className="row-booking">
                    {bookings.map((booking, index) => (
                      <div className="col_booking_time" key={index}>
                        <div className="pre_booking_items">
                          <div className="pre_booking_items__time">
                            <span>{booking.booking_start_time} - {booking.booking_end_time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
            ) : (
                <p>No bookings available for the selected date.</p>
            )}
        </div>
    );
}

export default Prebooking;
