"use client";

import BookingModal from "@/app/components/BookingModal";
import CarCard from "@/app/components/CarCard";
import Search from "@/app/components/Search";
import { useAuth } from "@/context/AuthContext";
import { carsApi } from "@/service/car";
import { useEffect, useState } from "react";

interface Car {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  carStatus: string;
  fuelType: string;
  transmissionType: string;
  image?: string;
  quantity: number;
}

export default function BrowseCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { user } = useAuth();

  const fetchCars = async () => {
    try {
      if (!user?.userId) return;
      const data = await carsApi.getCars();
      setCars(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Failed to fetch cars:", error);
    } finally {
      setLoading(false);
    }
  };

  
  

  useEffect(() => {
    fetchCars();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading cars...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">

        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onBook={(selected) => {
              setSelectedCar(selected);
              setIsModalOpen(true);
            }}
          />
        ))}

        {isModalOpen && selectedCar && (
          <BookingModal
            car={selectedCar}
            userId={user?.userId || ""}
            onClose={() => setIsModalOpen(false)}
            onBookingCreated={() => {
              alert("Booking created successfully!");
              setIsModalOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
