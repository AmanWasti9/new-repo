import { SlidersHorizontal, Search as SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="flex justify-between mb-8 md:mr-16">
      <div className="relative flex-1 mr-8">
        <SearchIcon
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400"
          size={20}
        />

        <input
          type="text"
          placeholder="Search cars..."
          className="w-full pl-10 pr-4 py-2 border border-blue-300 bg-blue-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div>
        <button className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-600 flex items-center">
          <SlidersHorizontal className="mr-2" /> Filter
        </button>
      </div>
    </div>
  );
}
