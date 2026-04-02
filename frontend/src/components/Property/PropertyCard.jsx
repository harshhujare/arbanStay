import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Edit2,
  Trash2,
  MoreVertical,
  Eye,
  Heart,
  MessageSquare,
} from "lucide-react";
import propertyService from "../../api/propertyService";

export default function PropertyCard({ property, onUpdate, onDelete, onEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  // Fix #5: Close dropdown when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      setLoading(true);
      await propertyService.deleteProperty(property._id);
      onDelete(property._id);
    } catch (error) {
      alert("Failed to delete property: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-200 overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <MapPin className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Mini Stats Overlay */}
        <div className="absolute bottom-2 left-2 flex gap-1.5">
          <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-md text-xs">
            <Eye className="w-3 h-3" />
            {property.views || 0}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-md text-xs">
            <Heart className="w-3 h-3" />
            {property.likes || 0}
          </span>
          <span className="flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded-md text-xs">
            <MessageSquare className="w-3 h-3" />
            {property.contactRequests || 0}
          </span>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              property.isAvailable !== false
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {property.isAvailable !== false ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Menu Button */}
        <div className="absolute top-3 right-3" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition"
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-10">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit && onEdit(property);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition text-left"
              >
                <Edit2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
                disabled={loading}
                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-red-50 transition text-left text-red-600 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">
                  {loading ? "Deleting..." : "Delete"}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Location */}
        <div className="flex items-center gap-1 text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          {/* Fix #1: backend has location.city only, no state field */}
          <span className="text-sm font-medium">
            {property.location?.city || "Unknown location"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {property.title}
        </h3>

        {/* Details */}
        {/* Fix #1: bedrooms/bathrooms may not exist in backend model — show gracefully */}
        <div className="flex items-center gap-4 text-gray-600 mb-3">
          {property.bedrooms != null && (
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms != null && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">{property.maxGuests} guests</span>
          </div>
        </div>

        {/* Price — Fix #2: use rentAmount, label as /month unless per_person */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold text-gray-900">
            {formatPrice(property.rentAmount || 0)}
          </span>
          <span className="text-sm text-gray-600">
            {property.rentType === "per_person" ? "/ person" : "/ month"}
          </span>
        </div>

        {/* Amenities Preview */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {property.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
              {property.amenities.length > 3 && (
                <span className="px-2 py-1 text-gray-500 text-xs">
                  +{property.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
