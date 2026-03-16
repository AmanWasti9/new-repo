"use client";

import { useEffect, useState } from "react";

interface CarFormData {
  brand: string;
  model: string;
  pricePerDay: number;
  carStatus: string;
  fuelType: string;
  transmissionType: string;
  totalQuantity: number;
}

interface CarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => void; // now sending FormData
  initialData?: CarFormData & { image?: string } | null;
  mode: "create" | "edit";
}

export default function CarModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  mode,
}: CarModalProps) {
  const [formData, setFormData] = useState<CarFormData>({
    brand: "",
    model: "",
    pricePerDay: 0,
    carStatus: "AVAILABLE",
    fuelType: "PETROL",
    transmissionType: "AUTOMATIC",
    totalQuantity: 1,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({ ...initialData });
      setImagePreview(initialData.image || "");
      setImageFile(null); // reset file, user can upload new one
    } else if (mode === "create") {
      setFormData({
        brand: "",
        model: "",
        pricePerDay: 0,
        carStatus: "AVAILABLE",
        fuelType: "PETROL",
        transmissionType: "AUTOMATIC",
        totalQuantity: 1,
      });
      setImagePreview("");
      setImageFile(null);
    }
  }, [initialData, mode]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "pricePerDay" || name === "totalQuantity" ? Number(value) : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      // optional: show preview
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const data = new FormData();
    data.append("brand", formData.brand);
    data.append("model", formData.model);
    data.append("pricePerDay", formData.pricePerDay.toString());
    data.append("totalQuantity", formData.totalQuantity.toString());
    data.append("fuelType", formData.fuelType);
    data.append("transmissionType", formData.transmissionType);
    data.append("carStatus", formData.carStatus);

    if (imageFile) {
      data.append("image", imageFile); // key must match Multer interceptor
    }

    onSubmit(data);

    // reset form after creation
    if (mode === "create") {
      setFormData({
        brand: "",
        model: "",
        pricePerDay: 0,
        carStatus: "AVAILABLE",
        fuelType: "PETROL",
        transmissionType: "AUTOMATIC",
        totalQuantity: 1,
      });
      setImagePreview("");
      setImageFile(null);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl animate-slide-in">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          {mode === "create" ? "Add New Car" : "Edit Car"}
        </h2>

        <div className="grid gap-5">
          {/* Brand & Model */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Brand</label>
              <input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Model</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Price & Quantity */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Price Per Day</label>
              <input
                name="pricePerDay"
                type="number"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Quantity</label>
              <input
                name="totalQuantity"
                type="number"
                value={formData.totalQuantity}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>

          {/* Fuel, Transmission & Status */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Transmission</label>
              <select
                name="transmissionType"
                value={formData.transmissionType}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="AUTOMATIC">Automatic</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
            <div className="flex-1 flex flex-col">
              <label className="text-gray-600 mb-1">Car Status</label>
              <select
                name="carStatus"
                value={formData.carStatus}
                onChange={handleChange}
                className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="AVAILABLE">Available</option>
                <option value="BOOKED">Booked</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="flex flex-col">
            <label className="text-gray-600 mb-2">Car Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="border rounded-lg p-2 cursor-pointer"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Car Preview"
                className="mt-3 w-40 h-28 object-cover rounded-lg border"
              />
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {mode === "create" ? "Create" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}