"use client";

import React, { useEffect, useState } from "react";

import {
  Cog,
  EvCharger,
  Fuel,
  Settings,
  Edit3,
  Trash2,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

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
  owner?: {
    id: string;
    name: string;
  };
}

interface CarCardProps {
  car: Car;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onBook?: (car: Car) => void;
}

export default function CarCard({
  car,
  onEdit,
  onDelete,
  onBook,
}: CarCardProps) {
  const { user } = useAuth();
  const router = useRouter();

  const role = user?.role?.toUpperCase() || null;

  const [quantity, setQuantity] = useState<number>(car.availableQuantity ?? car.totalQuantity ?? 0);

  // sync when prop changes (e.g., refetch from server)
  useEffect(() => {
    setQuantity(car.availableQuantity ?? 0);
  }, [car.availableQuantity]);

  // Listen for optimistic booking events and decrement quantity locally
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev?.detail?.carId === car.id) {
        setQuantity((q) => Math.max(q - 1, 0));
      }
    };

    window.addEventListener("booking:created", handler as EventListener);
    return () =>
      window.removeEventListener("booking:created", handler as EventListener);
  }, [car.id]);

  // Listen for booking deletion events and increment quantity locally
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent;
      if (ev?.detail?.carId === car.id) {
        setQuantity((q) => q + 1);
      }
    };

    window.addEventListener("booking:deleted", handler as EventListener);
    return () =>
      window.removeEventListener("booking:deleted", handler as EventListener);
  }, [car.id]);

  const getTransmissionIcon = (transmission: string) => {
    switch (transmission) {
      case "Automatic":
        return <Cog className="h-5 w-5 text-gray-500" />;
      case "Manual":
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Cog className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFuelIcon = (fuelType: string) => {
    switch (fuelType) {
      case "Electric":
        return <EvCharger className="h-5 w-5 text-gray-500" />;
      case "Petrol":
      case "Diesel":
        return <Fuel className="h-5 w-5 text-gray-500" />;
      default:
        return <EvCharger className="h-5 w-5 text-gray-500" />;
    }
  };

  const statusColor = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("available") || s === "available")
      return "bg-green-100 text-green-800";
    if (s.includes("booked") || s === "booked")
      return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col hover:shadow-xl transition-shadow duration-200">
      <div className="relative">
        <img
          src={
            car.image
              ? `http://localhost:5000/${car.image}`
              : "https://tse2.mm.bing.net/th/id/OIP.M_yY0n1i9_2YcPRvPC9UyAHaEn?rs=1&pid=ImgDetMain&o=7&rm=3"
          }
          alt={`${car.brand} ${car.model}`}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs font-medium text-gray-500 tracking-wide">
              {car.brand.toUpperCase()}
            </p>
            <h3 className="text-lg font-semibold leading-tight">{car.model}</h3>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-black">
              ${car.pricePerDay}
            </div>
            <div className="text-xs text-gray-500">/day</div>
          </div>
        </div>

        <div className="flex gap-4 text-gray-600 mb-4">
          <div className="flex items-center gap-2">
            {getTransmissionIcon(car.transmissionType)}
            <span className="text-sm font-light">{car.transmissionType}</span>
          </div>
          <div className="flex items-center gap-2">
            {getFuelIcon(car.fuelType)}
            <span className="text-sm font-light">{car.fuelType}</span>
          </div>
          {/* <div className="flex items-center gap-2">
            <span className="text-sm font-light">Total Quantity: {car.totalQuantity}</span>
          </div> */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-light">Available: {car.availableQuantity}</span>
          </div>
        </div>

        <div className="mt-auto">
          {role === "OWNER" ? (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit && onEdit(car.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>

              <button
                onClick={() => onDelete && onDelete(car.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded border border-red-100 text-sm hover:bg-red-100"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onBook && onBook(car)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                title="Book now"
              >
                <Calendar className="h-4 w-4" />
                Book Now
              </button>

              {car.owner && car.owner.id !== user?.userId && (
                <button
                  onClick={() => router.push(`/chat?userId=${car.owner?.id}`)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center justify-center"
                  title="Chat with owner"
                >
                  <MessageSquare className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
