import React from "react";
import BookingItem from "./BookingItem";

interface BookingListProps {
  bookings: any[];
  onEdit?: (id: string, startDate: string, endDate: string) => void;
  onDelete?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const BookingList: React.FC<BookingListProps> = ({ bookings, onEdit, onDelete, onCancel }) => {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return <p>No bookings found.</p>;
  }

  return (
    <div>
      {bookings.map((booking) => (
        <BookingItem
          key={booking.id}
          booking={booking}
          onEdit={onEdit}
          onDelete={onDelete}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
};

export default BookingList;