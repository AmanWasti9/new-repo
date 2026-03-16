"use client";

import React, { useMemo } from "react";

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  quantity: number;
  car?: {
    brand: string;
    model: string;
  };
}

interface BookingStatusCardsProps {
  bookings: Booking[];
}

const BookingStatusCards: React.FC<BookingStatusCardsProps> = ({
  bookings,
}) => {
  const now = new Date();

  const stats = useMemo(() => {
    const counts: {
      ongoing: { total: number; cars: Record<string, number> };
      confirmed: { total: number; cars: Record<string, number> };
      cancelled: { total: number; cars: Record<string, number> };
    } = {
      ongoing: { total: 0, cars: {} },
      confirmed: { total: 0, cars: {} },
      cancelled: { total: 0, cars: {} },
    };

    bookings.forEach((b) => {
      const carName = b.car ? `${b.car.brand} ${b.car.model}` : "Unknown Car";
      const qty = b.quantity ?? 1;

      if (b.status === "CANCELLED") {
        counts.cancelled.total += 1;
        counts.cancelled.cars[carName] =
          (counts.cancelled.cars[carName] || 0) + qty;
      } else if (b.status === "CONFIRMED") {
        counts.confirmed.total += 1;
        counts.confirmed.cars[carName] =
          (counts.confirmed.cars[carName] || 0) + qty;

        if (new Date(b.startDate) <= now) {
          counts.ongoing.total += 1;
          counts.ongoing.cars[carName] =
            (counts.ongoing.cars[carName] || 0) + qty;
        }
      }
    });

    return counts;
  }, [bookings, now]);

  const renderCars = (cars: Record<string, number>) =>
    Object.entries(cars).map(([name, qty]) => (
      <div key={name} className="flex justify-between items-center">
        <span className="text-sm text-gray-700 font-medium">{name}</span>
        <span className="inline-block text-gray-800 text-xs font-medium">
          {qty}
        </span>
      </div>
    ));

  return (
    <div className="flex gap-6 mb-6 justify-center items-stretch">
      <div className="bg-green-50 text-green-700 px-6 py-6 rounded-lg shadow text-center w-60 flex-1 flex flex-col justify-between">
        <p className="text-md font-medium">Ongoing</p>
        <p className="text-2xl font-bold">{stats.ongoing.total}</p>
        <div className="mt-2 text-left">{renderCars(stats.ongoing.cars)}</div>
      </div>

      <div className="bg-blue-50 text-blue-700 px-6 py-6 rounded-lg shadow text-center w-60 flex-1 flex flex-col justify-between">
        <p className="text-md font-medium">Confirmed</p>
        <p className="text-2xl font-bold">{stats.confirmed.total}</p>
        <div className="mt-2 text-left">{renderCars(stats.confirmed.cars)}</div>
      </div>

      <div className="bg-red-50 text-red-700 px-6 py-6 rounded-lg shadow text-center w-60 flex-1 flex flex-col justify-between">
        <p className="text-md font-medium">Cancelled</p>
        <p className="text-2xl font-bold">{stats.cancelled.total}</p>
        <div className="mt-2 text-left">{renderCars(stats.cancelled.cars)}</div>
      </div>
    </div>
  );
};

export default BookingStatusCards;
