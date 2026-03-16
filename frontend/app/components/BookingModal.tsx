"use client";

import React, { useEffect, useState } from "react";
import { bookingsApi } from "@/service/booking";
import { paymentsApi } from "@/service/payments";

interface BookingModalProps {
  car: any;
  userId: string;
  onClose: () => void;
  onBookingCreated: () => void;
}

export default function BookingModal({
  car,
  userId,
  onClose,
  onBookingCreated,
}: BookingModalProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [touched, setTouched] = useState({
    paymentMethod: false,
  });
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [quantity, setQuantity] = useState(1);

  // const handleSubmit = async () => {
  //   if (!startDate || !endDate) {
  //     setError("Please select both start and end dates");
  //     return;
  //   }

  //   if (!paymentMethod) {
  //     setTouched({ ...touched, paymentMethod: true });
  //     setError("Please select a payment method");
  //     return;
  //   }

  //   if (new Date(startDate) > new Date(endDate)) {
  //     setError("Start date cannot be after end date");
  //     return;
  //   }

  //   if (paymentMethod === "CARD") {
  //     if (!cardNumber || !cvv) {
  //       setError("Card details are required");
  //       return;
  //     }

  //     if (!paidAmount || Number(paidAmount) <= 0) {
  //       setError("Enter valid payment amount");
  //       return;
  //     }
  //   }

  //   if (!quantity || quantity <= 0) {
  //     setError("Quantity must be at least 1");
  //     return;
  //   }

  //   if (quantity > (car.availableQuantity ?? car.totalQuantity)) {
  //     setError("Selected quantity exceeds available stock");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");

  //   try {
  //     const bookingRes = await bookingsApi.createBooking({
  //       carId: car.id,
  //       startDate,
  //       endDate,
  //       quantity,
  //     });
  //     // console.log(bookingRes);
  //     const bookingId = bookingRes?.data?.id;
  //     // console.log(bookingId);
  //     if (!bookingId) throw new Error("Booking ID not found");

  //     const paymentMethodRes = await paymentsApi.createPaymentMethod({
  //       bookingId,
  //       paymentMethod,
  //       paidAmount: paymentMethod === "CARD" ? Number(paidAmount) : 0,
  //     });

  //     console.log(paymentMethodRes);
  //     const paymentId = paymentMethodRes?.data?.id;
  //     console.log(paymentId);

  //     if (!paymentId) throw new Error("Payment ID not found");

  //     if (paymentMethod === "CARD") {
  //       const transactionId =
  //         "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  //       await paymentsApi.updateTransactionToSuccess({
  //         paymentId,
  //         transactionId,
  //       });
  //     }

  //     // notify UI for optimistic quantity update
  //     try {
  //       window.dispatchEvent(
  //         new CustomEvent("booking:created", { detail: { carId: car.id } }),
  //       );
  //     } catch (e) {
  //       // ignore if dispatch fails in non-browser env
  //     }

  //     onBookingCreated();
  //     onClose();
  //   } catch (err: any) {
  //     setError(err.message || "Something went wrong");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    setError("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be after end date");
      return;
    }

    if (!quantity || quantity <= 0) {
      setError("Quantity must be at least 1");
      return;
    }

    if (quantity > (car.availableQuantity ?? car.totalQuantity)) {
      setError("Selected quantity exceeds available stock");
      return;
    }

    if (!paymentMethod) {
      setTouched({ ...touched, paymentMethod: true });
      setError("Please select a payment method");
      return;
    }

    if (paymentMethod === "CARD") {
      if (!cardNumber || !cvv) {
        setError("Card details are required");
        return;
      }

      if (!/^\d{16}$/.test(cardNumber)) {
        setError("Card number must be 16 digits");
        return;
      }

      if (!/^\d{3}$/.test(cvv)) {
        setError("CVV must be 3 digits");
        return;
      }

      if (!paidAmount || Number(paidAmount) <= 0) {
        setError("Enter valid payment amount");
        return;
      }
    }

    setLoading(true);

    try {
      const bookingRes = await bookingsApi.createBooking({
        carId: car.id,
        startDate,
        endDate,
        quantity,
      });

      const bookingId = bookingRes?.data?.id;
      if (!bookingId) throw new Error("Booking ID not found");

      const totalPrice = bookingRes?.data?.totalPrice; // get total price from backend

      const paymentRes = await paymentsApi.createPaymentMethod({
        bookingId,
        paymentMethod,
        paidAmount: paymentMethod === "CARD" ? Number(paidAmount) : 0,
      });

      const paymentId = paymentRes?.data?.id;
      if (!paymentId) throw new Error("Payment ID not found");

      if (paymentMethod === "CARD") {
        const transactionId =
          "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        await paymentsApi.updateTransactionToSuccess({
          paymentId,
          transactionId,
        });
      }

      alert(`Booking successful! Total price: $${totalPrice}`);

      window.dispatchEvent(
        new CustomEvent("booking:created", { detail: { carId: car.id } }),
      );

      onBookingCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0]; // disables past dates

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-lg transform transition-all scale-100 sm:scale-105">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Book {car.brand} {car.model}
        </h2>

        {error && (
          <p className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</p>
        )}

        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:gap-2">
          <div className="flex flex-col flex-1">
            <label className="mb-1 font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              min={today}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col flex-1">
            <label className="mb-1 font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              min={startDate || today}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="mb-6">
          <label className="mb-1 font-medium text-gray-700">
            Quantity (Available: {car.availableQuantity ?? car.totalQuantity})
          </label>
          <input
            type="number"
            min={1}
            max={car.availableQuantity ?? car.totalQuantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="mb-1 font-medium text-gray-700">
            Total Price $ {car.pricePerDay * quantity}
          </label>
        </div>

        <div className="mb-6">
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              onBlur={() => setTouched({ ...touched, paymentMethod: true })}
              className="w-full px-4 py-3 border-b-2 transition-all duration-300 focus:outline-none text-black"
            >
              <option value="" disabled>
                Select your payment method
              </option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="ONLINE">Online</option>
            </select>
          </div>
          {paymentMethod === "CARD" && (
            <div className="flex flex-col gap-3 mt-4">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="border p-2 rounded"
              />
            </div>
          )}

          {paymentMethod === "CARD" && (
            <div className="mt-4">
              <input
                type="number"
                placeholder="Enter Amount to Pay"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Now"}
          </button>
        </div>
      </div>
    </div>
  );
}
