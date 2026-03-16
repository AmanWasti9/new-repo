"use client";

import { useEffect, useState } from "react";
import { carsApi } from "@/service/car";
import SummaryCard from "@/app/components/SummaryCard";
import { bookingsApi } from "@/service/booking";
import { paymentsApi } from "@/service/payments";


export default function OwnerDashboard() {
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

      const [carsResp, bookingsResp, paymentsResp] = await Promise.all([
        carsApi.getCarsByOwnerId(),
        bookingsApi.getbookingsByOwnerId(),
        paymentsApi.getPaymentsByOwnerId(),
      ]);
      // console.log("Fetched cars:", carsResp);
      console.log("Fetched bookings:", bookingsResp);
      console.log("Fetched payments:", paymentsResp);

      const carsData = Array.isArray(carsResp)
        ? carsResp
        : carsResp?.data || [];
      const bookingsData = Array.isArray(bookingsResp)
        ? bookingsResp
        : bookingsResp?.data || [];
      const paymentsData = Array.isArray(paymentsResp)
        ? paymentsResp
        : paymentsResp?.data || [];

      const successfulPayments = paymentsData.filter(
        (p: any) => p.paymentStatus === "SUCCESS" || p.paymentStatus === "PENDING",
      );

      setCars(carsData);
      setBookings(bookingsData);
      setPayments(successfulPayments);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch data";
      setError(errorMessage);
      console.error("Error fetching owner data:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "brand",
      label: "Brand",
    },
    {
      key: "model",
      label: "Model",
    },
    {
      key: "pricePerDay",
      label: "Price / Day",
    },
    {
      key: "transmissionType",
      label: "Transmission",
    },
    {
      key: "fuelType",
      label: "Fuel Type",
    },
    {
      key: "availableQuantity",
      label: "Available",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <SummaryCard cars={cars} bookings={bookings} payments={payments} />

      {/* <div className="rounded-lg border-radius-md overflow-hidden mt-6">
        <Table
          columns={columns}
          data={cars}
          loading={loading}
          emptyMessage="No cars listed yet"
          rowKey="id"
        />
      </div> */}
    </div>
  );
}
