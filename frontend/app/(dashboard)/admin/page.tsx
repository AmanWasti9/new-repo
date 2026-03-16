"use client";

import { useEffect, useState } from "react";
import { userApi } from "@/service/user";
import { carsApi } from "@/service/car";
import SummaryCard from "@/app/components/SummaryCard";
import { bookingsApi } from "@/service/booking";
import { paymentsApi } from "@/service/payments";


export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [cars, setCars] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userResponse = await userApi.getAllUsers();
      const userData = Array.isArray(userResponse)
        ? userResponse
        : userResponse.data || [];

      const filteredUsers = userData.filter(
        (user: any) => user.role !== "ADMIN",
      );

      setUsers(filteredUsers);

      const carResponse = await carsApi.getCars();
      const carsData = Array.isArray(carResponse)
        ? carResponse
        : carResponse.data || [];

      setCars(carsData);

      const paymentResponse = await paymentsApi.getAllPayments();
      const paymentsData = Array.isArray(paymentResponse)
        ? paymentResponse
        : paymentResponse.data || [];

      setPayments(paymentsData);

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
        users={users}
        cars={cars}
        bookings={bookings}
        payments={payments}
      />
    </div>
  );
}
