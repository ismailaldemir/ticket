import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Box,
  TextField,
  Typography,
  Paper,
  Button,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  LocationOn as LocationOnIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";

const KonumSec = memo(
  ({
    value = {},
    onChange = () => {},
    apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
  }) => {
    const [address, setAddress] = useState(value?.adres || "");
    const [mapCenter, setMapCenter] = useState({
      lat: value?.lat || 39.9334,
      lng: value?.lng || 32.8597,
    });
    const [marker, setMarker] = useState({
      lat: value?.lat || null,
      lng: value?.lng || null,
    });
    const [mapError, setMapError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const mapContainerStyle = {
      width: "100%",
      height: "400px",
    };

    useEffect(() => {
      if (!apiKey) {
        setMapError("Google Maps API anahtarı eksik!");
        return;
      }
      if (apiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
        setMapError("Geçerli bir Google Maps API anahtarı gerekli!");
      }
    }, [apiKey]);

    const handleMapClick = useCallback(
      (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();

        setMarker({ lat, lng });
        setIsLoading(true);

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          setIsLoading(false);
          if (status === "OK" && results[0]) {
            const newAddress = results[0].formatted_address;
            setAddress(newAddress);
            onChange({ lat, lng, adres: newAddress });
          } else {
            toast.error("Adres bulunamadı!");
          }
        });
      },
      [onChange]
    );

    const handleAddressSearch = useCallback(() => {
      if (!address) {
        toast.warn("Lütfen bir adres girin!");
        return;
      }

      setIsLoading(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        setIsLoading(false);
        if (status === "OK" && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();

          setMapCenter({ lat, lng });
          setMarker({ lat, lng });
          onChange({ lat, lng, adres: address });
        } else {
          toast.error("Adres bulunamadı, lütfen başka bir adres deneyin!");
        }
      });
    }, [address, onChange]);

    if (mapError) {
      return (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="error">{mapError}</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ width: "100%" }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "flex-end", gap: 1 }}>
          <TextField
            fullWidth
            label="Adres Ara"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddressSearch()}
            placeholder="Adres girin veya haritada bir konum seçin"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOnIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddressSearch}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <SearchIcon />
            }
          >
            {isLoading ? "Aranıyor..." : "Ara"}
          </Button>
        </Box>

        <Paper
          elevation={3}
          sx={{ p: 0, mb: 2, borderRadius: 2, overflow: "hidden" }}
        >
          <LoadScript googleMapsApiKey={apiKey} language="tr">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={mapCenter}
              zoom={marker.lat ? 15 : 6}
              onClick={handleMapClick}
              options={{
                streetViewControl: false,
                mapTypeControlOptions: { position: 7 },
              }}
            >
              {marker.lat && marker.lng && (
                <Marker
                  position={marker}
                  draggable={true}
                  onDragEnd={handleMapClick}
                />
              )}
            </GoogleMap>
          </LoadScript>
        </Paper>

        {marker.lat && marker.lng && (
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Konum: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          </Typography>
        )}
      </Box>
    );
  }
);

KonumSec.displayName = "KonumSec";

export default KonumSec;
