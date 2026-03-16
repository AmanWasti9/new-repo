import { useAuth } from "@/context/AuthContext";
import QuickStatsDoughnut from "./QuickStatsDoughnut";
import BarChart from "./BarChart";

interface Car {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  carStatus: string;
  fuelType: string;
  transmissionType: string;
  image?: string;
  totalQuantity: number;
  availableQuantity: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  status: "CONFIRMED" | "PENDING" | "CANCELLED";
  totalPrice: number;
  quantity: number;
  payment?: {
    paidAmount: number;
    remainingAmount: number;
  };
  car?: Car;
  user?: User;
  updatedAt: string;
}

interface Payment {
  id: string;
  booking: Booking;
  paidAmount: number;
  remainingAmount: number;
  amount: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string;
  paidAt: string;
}

interface SummaryCardProps {
  bookings?: Booking[];
  cars?: Car[];
  users?: User[];
  payments?: Payment[];
}

export default function SummaryCard({
  cars,
  users,
  bookings,
  payments,
}: SummaryCardProps) {
  const carsList: Car[] = cars ?? [];
  const usersList: User[] = users ?? [];
  const bookingsList: Booking[] = bookings ?? [];
  const paymentsList: Payment[] = payments ?? [];
  const { user } = useAuth();

  // Cars calculations
  const totalCars = carsList.reduce((sum, car) => sum + car.totalQuantity, 0);
  const availableCars = carsList.reduce(
    (sum, car) => sum + car.availableQuantity,
    0,
  );

  // Bookings and earnings calculations
  const totalBookings = bookingsList.length;
  const confirmedBookings = bookingsList.filter(
    (b) => b.status === "CONFIRMED",
  ).length;
  const cancelledBookings = bookingsList.filter(
    (b) => b.status === "CANCELLED",
  ).length;

   const now = new Date();
   const ongoingBookings = bookingsList.filter((b) => {
     const startDate = new Date(b.startDate);
     return b.status === "CONFIRMED" && startDate <= now;
   }).length;


  // Calculate totals from successful payments when available
  const successPayments = paymentsList.filter(
    (p) => p.paymentStatus === "SUCCESS" || p.paymentStatus === "PENDING",
  );

  const totalPaid = successPayments.reduce(
    (sum, p) => sum + Number(p.paidAmount ?? 0),
    0,
  );

  const totalRemaining = successPayments.reduce(
    (sum, p) => sum + Number(p.remainingAmount ?? 0),
    0,
  );

  const totalEarnings = totalPaid + totalRemaining;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

  const totalUsers = usersList.length;

  return (
    <div className="space-y-6">
      {/* Admin Summary Cards */}
      {bookings && cars && user?.role === "ADMIN" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Users</p>
              <p className="text-3xl font-bold">{totalUsers}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Cars</p>
              <p className="text-3xl font-bold">{totalCars}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold">{totalBookings}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-12 rounded-lg bg-white shadow-md">
              <p className="text-gray-600 font-bold text-3xl mb-6">
                Quick Stats
              </p>
              <div className="w-64 h-64 mx-auto">
                <QuickStatsDoughnut
                  labels={["Available Cars", "Active Bookings", "Cancelled"]}
                  data={[availableCars, confirmedBookings, cancelledBookings]}
                />
              </div>
            </div>
            <div className="p-12 rounded-lg bg-white shadow-md">
              <p className="text-gray-600 font-bold text-3xl mb-6">
                Recent Bookings
              </p>
              {bookingsList
                .filter((booking) => booking.status === "CONFIRMED")
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .slice(0, 3)
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="mb-4 p-4 rounded-lg bg-white shadow-md hover:bg-gray-50 transition"
                  >
                    <p className="text-sm text-gray-500">
                      {booking.car?.brand} {booking.car?.model}
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-md font-light">
                        Customer Name:{" "}
                        <span className="text-md font-medium ">
                          {booking.user?.name}
                        </span>{" "}
                      </span>
                      <span
                        className={`${
                          booking.status === "CONFIRMED"
                            ? "text-green-500"
                            : booking.status === "PENDING"
                              ? "text-yellow-500"
                              : "text-red-500"
                        } font-semibold`}
                      >
                        {booking.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Owner Summary Cards*/}
      {bookings && cars && user?.role === "OWNER" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Cars</p>
              <p className="text-3xl font-bold">{totalCars}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Earnings</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalEarnings)}
              </p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Paid</p>
              <p className="text-3xl font-bold">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Remaining</p>
              <p className="text-3xl font-bold">
                {formatCurrency(totalRemaining)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="p-12 rounded-lg bg-white shadow-md">
              <p className="text-gray-600 font-bold text-3xl mb-6">
                Quick Stats
              </p>
              <div className="w-64 h-64 mx-auto">
                <QuickStatsDoughnut
                  labels={[
                    "Total Bookings",
                    "Active Bookings",
                    "Cancelled Bookings",
                  ]}
                  data={[totalBookings, confirmedBookings, cancelledBookings]}
                />
              </div>
            </div>

            <div className="p-12 rounded-lg bg-white shadow-md">
              <p className="text-gray-600 font-bold text-3xl mb-6">
                Recent Bookings
              </p>
              {bookingsList
                .filter((booking) => booking.status === "CONFIRMED")
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .slice(0, 3)
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="mb-4 p-4 rounded-lg bg-white shadow-md hover:bg-gray-50 transition"
                  >
                    <p className="text-sm text-gray-500">
                      {booking.car?.brand} {booking.car?.model}
                    </p>
                    <p className="flex justify-between items-center">
                      <span className="text-md font-light">
                        Customer Name:{" "}
                        <span className="text-md font-medium ">
                          {booking.user?.name}
                        </span>{" "}
                      </span>
                      <span
                        className={`${
                          booking.status === "CONFIRMED"
                            ? "text-green-500"
                            : booking.status === "PENDING"
                              ? "text-yellow-500"
                              : "text-red-500"
                        } font-semibold`}
                      >
                        {booking.status}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startDate).toLocaleDateString()} -{" "}
                      {new Date(booking.endDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer Summary Cards */}
      {bookings && user?.role === "CUSTOMER" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold">{totalBookings}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold">{confirmedBookings}</p>
            </div>
            <div className="py-12 rounded-lg bg-white shadow-md text-center">
              <p className="text-gray-600">Cancelled</p>
              <p className="text-3xl font-bold">{cancelledBookings}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-128 bg-white rounded-lg shadow-md p-12">
              <BarChart
                labels={["Active Bookings", "Ongoing Bookings", "Cancelled"]}
                data={[confirmedBookings, ongoingBookings, cancelledBookings]}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
