"use client";

import React from "react";

interface Booking {
  id: string;
  car?: { brand?: string; model?: string };
  startDate: string;
  endDate: string;
  status: string;
}

interface OngoingBookingsCardsProps {
  bookings: Booking[];
}

const OngoingBookingsCards: React.FC<OngoingBookingsCardsProps> = ({
  bookings,
}) => {
  const now = new Date();

  // Filter bookings that are confirmed and started
  const ongoingBookings = bookings.filter(
    (b) => b.status === "CONFIRMED" && new Date(b.startDate) <= now,
  );

  if (ongoingBookings.length === 0) return null;

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ongoingBookings.map((booking) => (
        <div
          key={booking.id}
          className="p-4 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            {/* Car Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {booking.car?.brand ?? ""} {booking.car?.model ?? ""}
              </h3>
              
            </div>

            {/* Status Badge */}
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
              Ongoing
            </span>
          </div>

          {/* Dates */}
          <div className="mt-4 flex gap-4">
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm font-medium">Start</span>
              <span className="mt-1 px-2 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                {new Date(booking.startDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm font-medium">End</span>
              <span className="mt-1 px-2 py-1 bg-gray-100 rounded text-gray-700 text-sm">
                {new Date(booking.endDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OngoingBookingsCards;
