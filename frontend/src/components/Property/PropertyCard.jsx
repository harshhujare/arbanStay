import { useState } from "react";
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Edit2,
  Trash2,
  MoreVertical,
} from "lucide-react";
import propertyService from "../../api/propertyService";

export default function PropertyCard({ property, onUpdate, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);

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

        {/* Menu Button */}
        <div className="absolute top-3 right-3">
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
                  // TODO: Implement edit
                  alert("Edit functionality coming soon!");
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
          <span className="text-sm font-medium">
            {property.location.city}, {property.location.state || "India"}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {property.title}
        </h3>

        {/* Details */}
        <div className="flex items-center gap-4 text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span className="text-sm">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span className="text-sm">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">{property.maxGuests} guests</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-semibold text-gray-900">
            {formatPrice(property.pricePerNight)}
          </span>
          <span className="text-sm text-gray-600">/ night</span>
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
