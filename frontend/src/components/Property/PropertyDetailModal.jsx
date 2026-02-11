import { X, MapPin, Bed, Bath, Users, Star } from "lucide-react";

export default function PropertyDetailModal({ property, isOpen, onClose }) {
  if (!isOpen || !property) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-2 h-96">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="col-span-2 md:col-span-1">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="hidden md:grid grid-rows-2 gap-2">
                    {property.images.slice(1, 3).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`${property.title} ${i + 2}`}
                        className="w-full h-full object-cover"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="col-span-2 bg-gray-200 flex items-center justify-center">
                  <MapPin className="w-20 h-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-5 h-5" />
                      <span>
                        {property.location.address &&
                          `${property.location.address}, `}
                        {property.location.city}
                        {property.location.state &&
                          `, ${property.location.state}`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-gray-900">
                      {formatPrice(property.pricePerNight)}
                    </div>
                    <div className="text-gray-600">per night</div>
                  </div>
                </div>
              </div>

              {/* Details Bar */}
              <div className="flex items-center gap-6 py-6 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">
                    {property.bedrooms} bedroom{property.bedrooms !== 1 && "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">
                    {property.bathrooms} bathroom
                    {property.bathrooms !== 1 && "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-900">
                    {property.maxGuests} guests
                  </span>
                </div>
              </div>

              {/* Host Info */}
              {property.host && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Hosted by {property.host.name}
                  </h3>
                  <p className="text-gray-600">{property.host.email}</p>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  About this place
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    What this place offers
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-gray-700"
                      >
                        <div className="w-6 h-6 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#FF5A5F] rounded-full" />
                        </div>
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <div className="pt-6 border-t border-gray-200">
                <button className="w-full px-8 py-4 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-all">
                  Reserve (Coming Soon)
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Booking functionality will be available in Week 4
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
