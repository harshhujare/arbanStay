import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Bed,
  Bath,
  Calendar,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Tv,
  Wind,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  ShieldCheck,
  X,
} from "lucide-react";
import propertyService from "../../api/propertyService";

// Amenity icon mapping
const amenityIcons = {
  WiFi: Wifi,
  TV: Tv,
  "Air Conditioning": Wind,
  "Free Parking": Car,
  Kitchen: UtensilsCrossed,
  Pool: Waves,
  Gym: Dumbbell,
  Security: ShieldCheck,
};

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getProperty(id);
      setProperty(data);
    } catch (err) {
      setError(err.message || "Failed to load property");
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

  const openInGoogleMaps = () => {
    if (property?.location?.coordinates) {
      const [lng, lat] = property.location.coordinates;
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        "_blank",
      );
    } else if (property?.location?.city) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          property.location.city + ", India",
        )}`,
        "_blank",
      );
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1,
    );
  };

  const getAmenityIcon = (amenity) => {
    const IconComponent = amenityIcons[amenity];
    return IconComponent ? <IconComponent size={24} /> : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Property not found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#E0484D] transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Full Screen Photo Gallery Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 bg-black z-50 overflow-y-auto">
          <div className="min-h-screen p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">
                All Photos ({property.images?.length || 0})
              </h2>
              <button
                onClick={() => setShowAllPhotos(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
              {property.images?.map((image, idx) => (
                <img
                  key={idx}
                  src={image}
                  alt={`${property.title} ${idx + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>
                {property.location?.address && `${property.location.address}, `}
                {property.location?.city}
                {property.location?.state && `, ${property.location.state}`}
              </span>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
            >
              <Share2 size={16} />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        {/* Bento Grid Image Layout - Desktop */}
        <div className="hidden md:block mb-8">
          <div className="max-w-[1120px] h-[445px] mx-auto">
            {property.images && property.images.length >= 4 ? (
              <div className="grid grid-cols-4 grid-rows-2 gap-2 h-full rounded-xl overflow-hidden">
                {/* Main image - left side, takes 2 columns and 2 rows */}
                <div
                  className="col-span-2 row-span-2 cursor-pointer relative group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:brightness-90 transition"
                  />
                </div>
                {/* Top right - 2 images */}
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img
                    src={property.images[1]}
                    alt={`${property.title} 2`}
                    className="w-full h-full object-cover group-hover:brightness-90 transition"
                  />
                </div>
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img
                    src={property.images[2]}
                    alt={`${property.title} 3`}
                    className="w-full h-full object-cover group-hover:brightness-90 transition"
                  />
                </div>
                {/* Bottom right - 2 images */}
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  <img
                    src={property.images[3]}
                    alt={`${property.title} 4`}
                    className="w-full h-full object-cover group-hover:brightness-90 transition"
                  />
                </div>
                <div
                  className="cursor-pointer relative group"
                  onClick={() => setShowAllPhotos(true)}
                >
                  {property.images[4] ? (
                    <img
                      src={property.images[4]}
                      alt={`${property.title} 5`}
                      className="w-full h-full object-cover group-hover:brightness-90 transition"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200"></div>
                  )}
                  {property.images.length > 5 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        +{property.images.length - 5} photos
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full rounded-xl overflow-hidden">
                <img
                  src={property.images?.[0] || ""}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {property.images && property.images.length > 0 && (
              <button
                onClick={() => setShowAllPhotos(true)}
                className="mt-4 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Show all {property.images.length} photos
              </button>
            )}
          </div>
        </div>

        {/* Image Slider - Mobile */}
        <div className="md:hidden mb-6">
          <div className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <>
                <img
                  src={property.images[currentImageIndex]}
                  alt={`${property.title} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full text-white text-sm">
                      {currentImageIndex + 1} / {property.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <MapPin className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Property Stats */}
            <div className="pb-6 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 text-gray-700">
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bed size={20} />
                  <span>
                    {property.bedrooms} bedroom{property.bedrooms !== 1 && "s"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath size={20} />
                  <span>
                    {property.bathrooms} bathroom
                    {property.bathrooms !== 1 && "s"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                About this place
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="py-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  What you'll get
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 text-gray-700"
                    >
                      <div className="w-6 h-6 flex items-center justify-center text-gray-600">
                        {getAmenityIcon(amenity) || (
                          <div className="w-2 h-2 bg-[#FF5A5F] rounded-full" />
                        )}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location Map Section */}
            <div className="py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Where you'll be
              </h2>
              <p className="text-gray-700 mb-4">
                {property.location?.city}
                {property.location?.state && `, ${property.location.state}`}
              </p>
              {property.location?.coordinates && (
                <div className="bg-gray-100 rounded-lg p-6 mb-4">
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <MapPin className="w-5 h-5 text-[#FF5A5F]" />
                    <span className="font-medium">
                      Exact location provided after booking
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Coordinates: {property.location.coordinates[1].toFixed(4)},{" "}
                    {property.location.coordinates[0].toFixed(4)}
                  </p>
                </div>
              )}
              <button
                onClick={openInGoogleMaps}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                <MapPin size={20} />
                Open in Google Maps
              </button>
            </div>

            {/* Host Information */}
            {property.host && (
              <div className="py-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Meet your host
                </h2>
                <div className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-[#FF5A5F] rounded-full flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                    {property.host.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {property.host.name}
                    </h3>
                    <p className="text-gray-600">{property.host.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sticky Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="border-2 border-gray-200 rounded-xl shadow-lg p-6">
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-semibold text-gray-900">
                      {formatPrice(
                        property.rentAmount || property.pricePerNight,
                      )}
                    </span>
                    <span className="text-gray-600">
                      {property.rentType === "per_person"
                        ? "/ person"
                        : "/ night"}
                    </span>
                  </div>
                  {property.rentType && (
                    <div className="inline-block px-3 py-1 bg-[#FF5A5F]/10 text-[#FF5A5F] rounded-full text-sm font-medium">
                      {property.rentType === "per_person"
                        ? "Per Person"
                        : "Entire Property"}
                    </div>
                  )}
                </div>

                {/* Contact Owner Button */}
                <button className="w-full py-4 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-all mb-4">
                  Contact Owner
                </button>

                <p className="text-center text-sm text-gray-500 mb-6">
                  You won't be charged yet
                </p>

                {/* Property Quick Stats */}
                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Max Guests</span>
                    <span className="font-medium">{property.maxGuests}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Bedrooms</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-700">
                    <span>Bathrooms</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                </div>
              </div>

              {/* Report Listing */}
              <div className="mt-6 text-center">
                <button className="text-gray-600 hover:text-gray-900 underline text-sm">
                  Report this listing
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
