import { MapPin, Bed, Bath, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PropertyGrid({ properties, loading }) {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <PropertySkeleton key={i} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600 text-lg mb-2">No properties found</p>
        <p className="text-gray-500">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyGridCard
          key={property._id}
          property={property}
          onClick={() => navigate(`/property/${property._id}`)}
        />
      ))}
    </div>
  );
}

function PropertyGridCard({ property, onClick }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group cursor-pointer" onClick={onClick}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-200 rounded-xl overflow-hidden mb-3">
        {property.images && property.images.length > 0 ? (
          <img
            src={property.images[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <MapPin className="w-12 h-12 text-gray-300" />
          </div>
        )}

        {/* Favorite Button (placeholder for future) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: Implement favorite functionality
          }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition"
        >
          <svg
            className="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div>
        {/* Location */}
        <div className="flex items-center gap-1 mb-1">
          <span className="text-sm font-semibold text-gray-900">
            {property.location.city}
            {property.location.state && `, ${property.location.state}`}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-700 mb-1 line-clamp-1">{property.title}</h3>

        {/* Details */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{property.maxGuests}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-semibold text-gray-900">
            {formatPrice(property.pricePerNight)}
          </span>
          <span className="text-sm text-gray-600">/ night</span>
        </div>
      </div>
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  );
}
