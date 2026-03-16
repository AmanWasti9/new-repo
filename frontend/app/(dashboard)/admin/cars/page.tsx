"use client";

import { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import { carsApi } from "@/service/car";

export interface Car {
  id: string;
  brand: string;
  model: string;
  pricePerDay: number;
  transmissionType: string;
  fuelType: string;
  carStatus: string;
  image?: string;
  createdAt?: string;
}

export default function AdminDashboard() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchData(currentPage, limit);
  }, [currentPage, limit]);

  const fetchData = async (page: number, limitValue: number) => {
    try {
      setLoading(true);
      setError(null);

      const carResponse = await carsApi.getCars(page, limitValue);
      const carsData = Array.isArray(carResponse)
        ? carResponse
        : carResponse.data || [];

      // Extract total from response.meta.total
      const totalCars = carResponse.meta?.total || 0;
      setTotal(totalCars);

      setCars(carsData);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch cars";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "car") => {
    try {
      if (type === "car") {
        await carsApi.deleteCar(id);
        setCars((prev) => prev.filter((car) => car.id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}`, error);
    }
  };

  const CarColumns = [
    { key: "brand", label: "Brand" },
    { key: "model", label: "Model" },
    { key: "pricePerDay", label: "Price / Day" },
    { key: "transmissionType", label: "Transmission" },
    { key: "fuelType", label: "Fuel Type" },
    { key: "availableQuantity", label: "Available" },
    { key: "carStatus", label: "Status" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && <div className="mb-4 text-red-500 font-medium">{error}</div>}

      <div>
        <Table
          columns={CarColumns}
          data={cars}
          loading={loading}
          emptyMessage="No cars found"
          rowKey="id"
          onDelete={(id) => handleDelete(id, "car")}
          showActions={true}
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          filtersConfig={[
            { key: "transmissionType", label: "Transmission Type" },
            { key: "fuelType", label: "Fuel Type" },
            { key: "carStatus", label: "Status" },
          ]}
        />
      </div>
    </div>
  );
}
