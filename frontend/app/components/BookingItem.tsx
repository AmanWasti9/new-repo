import { on } from "events";
import React, { useState } from "react";

interface BookingItemProps {
  booking: any;
  onEdit?: (id: string, startDate: string, endDate: string) => void;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const BookingItem: React.FC<BookingItemProps> = ({
  booking,
  onEdit,
  onDelete,
  onCancel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [startDate, setStartDate] = useState(booking.startDate);
  const [endDate, setEndDate] = useState(booking.endDate);

  const handleSave = () => {
    if (onEdit) {
      onEdit(booking.id, startDate, endDate);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-300 py-4 px-2 hover:bg-gray-50 space-y-2 sm:space-y-0">
      {/* Car & User */}
      <div className="flex-1 flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
        <div className="min-w-[100px]">
          <p className="font-semibold text-gray-700">
            {booking.car?.brand} {booking.car?.model}
          </p>
          <p className="text-gray-500">{booking.user?.name}</p>
        </div>

        {/* Dates */}
        <div className="flex gap-4 min-w-[200px]">
          {isEditing ? (
            <>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border rounded px-2 py-1 text-sm"
              />
            </>
          ) : (
            <>
              <div>
                <p className="text-gray-500 text-xs">Start</p>
                <p className="text-gray-700 text-sm">{booking.startDate}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">End</p>
                <p className="text-gray-700 text-sm">{booking.endDate}</p>
              </div>
            </>
          )}
        </div>

        {/* Status */}
        <div className="min-w-[100px]">
          <p className="text-gray-500 text-xs">Status</p>

          <p
            className={`text-sm font-medium ${
              booking.status === "CONFIRMED"
                ? "text-green-600"
                : booking.status === "PENDING"
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {booking.status}
          </p>
        </div>
        <div className="min-w-[100px]">
          <p className="text-gray-500 text-xs">Payment Status</p>

          {(() => {
            const paidAmount = parseFloat(booking.payment?.paidAmount || 0);
            const remainingPayment = parseFloat(
              booking.payment?.remainingAmount || 0,
            );

            let status = "PENDING";
            let color = "text-yellow-600";

            if (paidAmount === 0 && remainingPayment === 0) {
              status = "REFUNDED";
              color = "text-gray-500";
            } else if (remainingPayment === 0) {
              status = "PAID";
              color = "text-green-600";
            } else if (paidAmount === 0) {
              status = "PENDING";
              color = "text-yellow-600";
            } else {
              status = "PARTIAL PAID";
              color = "text-blue-600";
            }

            return <p className={`text-sm font-medium ${color}`}>{status}</p>;
          })()}
        </div>

        {/* Mode */}
        <div className="min-w-[100px]">
          <p className="text-gray-500 text-xs">Mode</p>

          <p className="text-gray-700">
            {booking.payment?.paymentMethod || "N/A"}
          </p>
        </div>

        {/* Pricing & Payment */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-[250px] text-sm">
          <div>
            <p className="text-gray-500 text-xs">Qty</p>
            <p className="text-gray-700">{booking.quantity}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Total</p>
            <p className="text-gray-700">${booking.totalPrice}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Paid</p>
            <p className="text-gray-700">
              ${booking?.payment?.paidAmount || 0}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Remaining</p>
            <p className="text-gray-700">
              ${booking?.payment?.remainingAmount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 mt-2 sm:mt-0">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 text-sm"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-sm"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <>
                <button
                  onClick={() => onDelete(booking.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </>
            )}
            {onCancel && booking.status !== "CANCELLED" && (
              <button
                onClick={() => onCancel(booking.id)}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BookingItem;
