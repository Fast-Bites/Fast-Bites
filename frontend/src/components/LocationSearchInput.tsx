import { useState } from "react";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const MOCK_LOCATIONS = [
  "Lekki Phase 1",
  "Lekki Phase 2",
  "Ajah",
  "Ikeja",
  "Victoria Island",
  "Yaba",
  "Surulere",
];

const LocationSearchInput: React.FC = () => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = MOCK_LOCATIONS.filter((loc) =>
    loc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative mb-24">
      {/* Input Container */}
      <div className="flex items-center gap-3 bg-white rounded-full px-5 py-4 shadow-lg">
        {/* Search Icon */}
        <FiSearch size={18} />

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Input your location"
          className="flex-1 outline-none text-background placeholder:text-background text-base font-medium"
        />

        {/* Dropdown Icon */}
        <FiChevronDown size={20} />
      </div>

      {/* Dropdown */}
      {open && query && (
        <div className="absolute bottom-full mb-2 w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          {filtered.length > 0 ? (
            filtered.map((loc) => (
              <div
                key={loc}
                onClick={() => {
                  setQuery(loc);
                  setOpen(false);
                }}
                className="px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
              >
                {loc}
              </div>
            ))
          ) : (
            <div className="px-5 py-3 text-sm text-gray-400">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput;
