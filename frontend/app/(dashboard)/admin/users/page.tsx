"use client";

import { useEffect, useState } from "react";
import Table from "@/app/components/Table";
import { userApi } from "@/service/user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUserPage() {
  const [users, setUsers] = useState<User[]>([]);
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

      const response = await userApi.getAllUsers(page, limitValue);

      const userData = response.data || [];
      // Extract total from response.meta.total
      const totalUsers = response.meta?.total || 0;

      // const filteredUsers = userData.filter(
      //   (user: User) => user.role !== "ADMIN",
      // );

      setUsers(userData);
      setTotal(totalUsers);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to fetch users";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: "user") => {
    try {
      if (type === "user") {
        await userApi.deleteUser(id);
        setUsers((prev) => prev.filter((user) => user.id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}`, error);
    }
  };

  const UserColumns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {error && <div className="mb-4 text-red-500 font-medium">{error}</div>}

      <div>
        <Table
          columns={UserColumns}
          data={users}
          loading={loading}
          emptyMessage="No users found"
          rowKey="id"
          onDelete={(id) => handleDelete(id, "user")}
          showActions={true}
          currentPage={currentPage}
          total={total}
          limit={limit}
          onPageChange={setCurrentPage}
          onLimitChange={setLimit}
          filtersConfig={[{ key: "role", label: "Role" }]}
        />
      </div>
    </div>
  );
}
