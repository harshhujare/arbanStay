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
  ArrowLeft,
  Navigation,
  Wifi,
  Tv,
  Wind,
  Car,
  UtensilsCrossed,
  Waves,
  Dumbbell,
  ShieldCheck,
  X,
  Phone,
  Crown,
  Lock,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import propertyService from "../../api/propertyService";
import { useAuth } from "../../context/AuthContext";
import ReviewSection from "../../components/Property/ReviewSection";
import PhoneVerifyModal from "../../components/Auth/PhoneVerifyModal";
import AuthModal from "../../components/Auth/AuthModal";

// Fix for default marker icon in Leaflet
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

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
  const { user, isAuthenticated, isPhoneVerified } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'contact' or 'directions'

  // Contact Owner state
  const [ownerPhone, setOwnerPhone] = useState(null);
  const [ownerName, setOwnerName] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState(null);
  const [contactRemaining, setContactRemaining] = useState(null);

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
    if (property?.coordinates?.latitude && property?.coordinates?.longitude) {
      const lat = property.coordinates.latitude;
      const lng = property.coordinates.longitude;
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

  const getDirections = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!isPhoneVerified) {
      setPendingAction("directions");
      setShowPhoneVerify(true);
      return;
    }
    openDirections();
  };

  const openDirections = () => {
    if (property?.coordinates?.latitude && property?.coordinates?.longitude) {
      const lat = property.coordinates.latitude;
      const lng = property.coordinates.longitude;
      // Opens Google Maps with directions from user's current location
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank",
      );
    } else if (property?.location?.city) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
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

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!isPhoneVerified) {
      setPendingAction("contact");
      setShowPhoneVerify(true);
      return;
    }

    await fetchContactOwner();
  };

  const fetchContactOwner = async () => {
    // Already revealed
    if (ownerPhone) return;

    try {
      setContactLoading(true);
      setContactError(null);
      const data = await propertyService.getOwnerContact(id);
      setOwnerPhone(data.data.ownerPhone);
      setOwnerName(data.data.ownerName);
      setContactRemaining(data.remaining);
    } catch (err) {
      const msg = err.message || "Failed to get contact details";
      if (msg.includes("verify your phone")) {
        // Backend enforced phone verification — show the verify modal
        setPendingAction("contact");
        setShowPhoneVerify(true);
      } else if (msg.includes("limit")) {
        setContactError(
          `Monthly limit reached (${user?.accountType === "premium" ? "10" : "1"} for ${user?.accountType || "free"} accounts). Upgrade to Premium for more!`,
        );
      } else if (msg.includes("authorized") || msg.includes("Not authorized")) {
        setContactError("Please log in to view owner contact details.");
      } else {
        setContactError(msg);
      }
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: "var(--text-secondary)" }}>Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg-primary)" }}>
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Property not found
          </h2>
          <p className="mb-6" style={{ color: "var(--text-secondary)" }}>{error}</p>
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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
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
        {/* Mobile Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-2 mb-4 -ml-2"
          style={{ color: "var(--text-secondary)" }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
              <MapPin className="w-5 h-5" />
              <span>
                {property.location?.address && `${property.location.address}, `}
                {property.location?.city}
                {property.location?.state && `, ${property.location.state}`}
              </span>
            </div>
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition"
              style={{ color: "var(--text-secondary)" }}
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
          </div>
          {property.images && property.images.length > 0 && (
            <button
              onClick={() => setShowAllPhotos(true)}
              className="mt-4 px-6 py-3 rounded-lg transition font-medium"
              style={{ background: "var(--bg-card)", border: "2px solid var(--text-primary)", color: "var(--text-primary)" }}
            >
              Show all {property.images.length} photos
            </button>
          )}
        </div>
        {/* Extra spacing to prevent overlap */}
        <div className="mb-8"></div>

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
            <div className="pb-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
              <div className="flex flex-wrap gap-4" style={{ color: "var(--text-secondary)" }}>
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
            <div className="py-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                About this place
              </h2>
              <p className="leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="py-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
                  What you'll get
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {property.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
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
            <div className="py-6" style={{ borderBottom: "1px solid var(--border-color)" }}>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Where you'll be
              </h2>
              <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
                {property.location?.city}
                {property.location?.state && `, ${property.location.state}`}
              </p>

              {/* Interactive Map - always show */}
              <div className="rounded-lg p-6 mb-4" style={{ background: "var(--bg-secondary)" }}>
                {property.coordinates?.latitude &&
                property.coordinates?.longitude ? (
                  <>
                    <div className="flex items-center gap-2 mb-4" style={{ color: "var(--text-secondary)" }}>
                      <MapPin className="w-5 h-5 text-[#FF5A5F]" />
                      <span className="font-medium">
                        Exact location provided after booking
                      </span>
                    </div>
                    <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                      Coordinates: {property.coordinates.latitude.toFixed(4)},{" "}
                      {property.coordinates.longitude.toFixed(4)}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center gap-2 mb-4" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="w-5 h-5 text-[#FF5A5F]" />
                    <span className="font-medium">
                      Approximate area shown - exact location provided after
                      booking
                    </span>
                  </div>
                )}

                {/* Interactive Map */}
                <div
                  className="rounded-lg overflow-hidden border border-gray-300"
                  style={{ height: "400px" }}
                >
                  <MapContainer
                    center={
                      property.coordinates?.latitude &&
                      property.coordinates?.longitude
                        ? [
                            property.coordinates.latitude,
                            property.coordinates.longitude,
                          ]
                        : [19.076, 72.8777] // Default to Mumbai if no coordinates
                    }
                    zoom={
                      property.coordinates?.latitude &&
                      property.coordinates?.longitude
                        ? 13
                        : 11
                    }
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {property.coordinates?.latitude &&
                      property.coordinates?.longitude && (
                        <Marker
                          position={[
                            property.coordinates.latitude,
                            property.coordinates.longitude,
                          ]}
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-semibold">{property.title}</p>
                              <p className="text-sm text-gray-600">
                                {property.location?.city}
                              </p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                  </MapContainer>
                </div>
              </div>
              <button
                onClick={getDirections}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white rounded-lg hover:shadow-lg transition font-semibold text-lg"
              >
                <Navigation size={24} />
                Get Directions
              </button>
            </div>

            {/* Host Information */}
            {property.host && (
              <div className="py-6">
                <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                  Meet your host
                </h2>
                <div className="flex items-start gap-4 p-6 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                  <div className="w-16 h-16 bg-[#FF5A5F] rounded-full flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                    {property.host.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                      {property.host.name}
                    </h3>
                    <p style={{ color: "var(--text-secondary)" }}>{property.host.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Section */}
            <ReviewSection propertyId={id} />
          </div>

          {/* Right Column - Sticky Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-xl shadow-lg p-6" style={{ border: "2px solid var(--border-color)", background: "var(--bg-card)" }}>
                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatPrice(
                        property.rentAmount || property.pricePerNight,
                      )}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
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
                {ownerPhone ? (
                  // Phone number revealed
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Owner Contact</p>
                        <p className="font-semibold text-gray-800">{ownerName}</p>
                      </div>
                    </div>
                    <a
                      href={`tel:${ownerPhone}`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                    >
                      <Phone className="w-5 h-5" />
                      {ownerPhone}
                    </a>
                    {contactRemaining !== null && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {contactRemaining} contact view
                        {contactRemaining !== 1 ? "s" : ""} remaining this month
                      </p>
                    )}
                  </div>
                ) : (
                  // Contact Owner button
                  <>
                    <button
                      onClick={handleContactOwner}
                      disabled={contactLoading}
                      className="w-full py-4 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-all mb-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {contactLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <Phone className="w-5 h-5" />
                          Contact Owner
                        </>
                      )}
                    </button>

                    {/* Error / Limit Reached Message */}
                    {contactError && (
                      <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                        <div className="flex items-start gap-2">
                          {contactError.includes("limit") ||
                          contactError.includes("Upgrade") ? (
                            <Crown className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          )}
                          <p className="text-sm text-amber-800">
                            {contactError}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <p className="text-center text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  You won't be charged
                </p>

                {/* Property Quick Stats */}
                <div className="space-y-3 pt-6" style={{ borderTop: "1px solid var(--border-color)" }}>
                  <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
                    <span>Max Guests</span>
                    <span className="font-medium">{property.maxGuests}</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
                    <span>Bedrooms</span>
                    <span className="font-medium">{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center justify-between" style={{ color: "var(--text-secondary)" }}>
                    <span>Bathrooms</span>
                    <span className="font-medium">{property.bathrooms}</span>
                  </div>
                </div>
              </div>

              {/* Report Listing */}
              <div className="mt-6 text-center">
                <button className="underline text-sm" style={{ color: "var(--text-muted)" }}>
                  Report this
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Verify Modal */}
      <PhoneVerifyModal
        isOpen={showPhoneVerify}
        onClose={() => { setShowPhoneVerify(false); setPendingAction(null); }}
        onVerified={() => {
          setShowPhoneVerify(false);
          // Execute the pending action after verification
          if (pendingAction === "contact") {
            fetchContactOwner();
          } else if (pendingAction === "directions") {
            openDirections();
          }
          setPendingAction(null);
        }}
      />

      {/* Auth Modal for non-logged-in users */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
