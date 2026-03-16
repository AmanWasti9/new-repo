"use client";

import { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import { bookingsApi } from "@/service/booking";
import OngoingBookingsCards from "@/app/components/OngoingBookingsCards";
import BookingStatusCards from "@/app/components/BookingStatusCards";

export default function CustomerBookingPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);
  const [allBookings, setAllBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  const fetchData = async (page: number, limitValue: number) => {
    try {
      setLoading(true);
      setError(null);

      const bookingResponse = await bookingsApi.getbookingsByCustomerId(
        page,
        limitValue,
      );
      const bookingData = Array.isArray(bookingResponse)
        ? bookingResponse
        : bookingResponse.data || [];
      const statusPriority: Record<string, number> = {
        ONGOING: 1,
        CONFIRMED: 2,
        PENDING: 3,
        CANCELLED: 4,
      };
      const sortedBookings = bookingData.sort((a: any, b: any) => {
        const statusCompare =
          (statusPriority[a.status] || 5) - (statusPriority[b.status] || 5);
        if (statusCompare !== 0) return statusCompare;

        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      });

      const totalBookings = bookingResponse.meta?.total || 0;
      setTotal(totalBookings);
      console.log(sortedBookings);

      setBookings(sortedBookings);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch bookings";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataWithoutPagination = async () => {
    try {
      setLoading(true);
      setError(null);

      const bookingResponse =
        await bookingsApi.getMyBookingsWithoutPagination();
      const bookingData = Array.isArray(bookingResponse)
        ? bookingResponse
        : bookingResponse.data || [];

      setAllBookings(bookingData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch bookings";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataWithoutPagination();
  }, []);
  const handleCancel = async (id: string) => {
    try {
      await bookingsApi.cancelBooking(id);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELLED" } : booking,
        ),
      );

      setAllBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: "CANCELLED" } : booking,
        ),
      );
    } catch (error) {
      console.error("Failed to cancel booking", error);
    }
  };

  const BookingsColumns = [
    {
      key: "car",
      label: "Car",
      render: (_: any, row: any) =>
        `${row.car?.brand ?? ""} ${row.car?.model ?? ""}`,
    },
    { key: "startDate", label: "Start" },
    { key: "endDate", label: "End" },
    { key: "status", label: "Booking Status" },

    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (_: any, row: any) => row.payment?.paymentStatus ?? "-",
    },
    { key: "quantity", label: "Qty." },

    {
      key: "paidAmount",
      label: "Paid Amount",
      render: (_: any, row: any) => row.payment?.paidAmount ?? 0,
    },
    {
      key: "remainingAmount",
      label: "Remaining Amount",
      render: (_: any, row: any) => row.payment?.remainingAmount ?? 0,
    },
  ];
  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && <div className="mb-4 text-red-500 font-medium">{error}</div>}
      <BookingStatusCards bookings={allBookings} />

      <div>
        <Table
          columns={BookingsColumns}
          data={bookings}
          loading={loading}
          emptyMessage="No bookings found"
          rowKey="id"
          onCancel={handleCancel}
          showActions={true}
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
           filtersConfig={[
            { key: "status", label: "Booking Status" },
            { key: "paymentStatus", label: "Payment Status" },
          ]}
        />
      </div>
    </div>
  );
}
