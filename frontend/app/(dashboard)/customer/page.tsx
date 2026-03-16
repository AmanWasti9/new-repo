"use client";

import { useEffect, useState } from "react";
import { carsApi } from "@/service/car";
import SummaryCard from "@/app/components/SummaryCard";
import { bookingsApi } from "@/service/booking";



export default function CustomerDashboard() {
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

   

      const carResponse = await carsApi.getCars();
      const carsData = Array.isArray(carResponse)
        ? carResponse
        : carResponse.data || [];

      setCars(carsData);


      const bookingResponse = await bookingsApi.getbookings();
      const bookingsData = Array.isArray(bookingResponse)
        ? bookingResponse
        : bookingResponse.data || [];

      setBookings(bookingsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch users, cars, or bookings";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && <div className="mb-4 text-red-500 font-medium">{error}</div>}

      <SummaryCard
        cars={cars}
        bookings={bookings}
      />
    </div>
  );
}
