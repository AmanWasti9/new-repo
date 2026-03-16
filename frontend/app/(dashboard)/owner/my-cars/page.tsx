"use client";

import CarCard from "@/app/components/CarCard";
import CarModal from "@/app/components/CarModal";
import { useAuth } from "@/context/AuthContext";
import { carsApi } from "@/service/car";
import { useEffect, useState } from "react";

export default function MyCars() {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { user } = useAuth();

  const fetchCars = async () => {
    try {
      if (!user?.userId) return;
      const data = await carsApi.getCarsByOwnerId();
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

  const handleCreate = async (data: any) => {
    if (!user?.userId) return;
    await carsApi.createCar(data);
    fetchCars();
  };

  const handleEdit = (id: string) => {
    const car = cars.find((c) => c.id === id);
    if (!car) return;

    setSelectedCar(car);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleUpdate = async (data: any) => {
    if (!selectedCar) return;
    await carsApi.updateCar(selectedCar.id, data);
    fetchCars();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this car?")) return;
    await carsApi.deleteCar(id);
    fetchCars();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading cars...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Cars</h1>

        <button
          onClick={() => {
            setSelectedCar(null);
            setModalMode("create");
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Add Car
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
        {cars.map((car) => (
          <CarCard
            key={car.id}
            car={car}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <CarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={modalMode === "create" ? handleCreate : handleUpdate}
        initialData={selectedCar || undefined}
        mode={modalMode}
      />
    </div>
  );
}