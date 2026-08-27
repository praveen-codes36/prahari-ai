export const reverseGeocode = async (lat: number, lng: number): Promise<{ address: string, city: string }> => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    if (!response.ok) {
      throw new Error("Failed to fetch address");
    }
    const data = await response.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Unknown City';
    const road = data.address?.road || '';
    const neighbourhood = data.address?.neighbourhood || data.address?.suburb || '';
    
    let formattedAddress = '';
    if (road && neighbourhood) {
        formattedAddress = `${road}, ${neighbourhood}`;
    } else if (road) {
        formattedAddress = road;
    } else if (neighbourhood) {
        formattedAddress = neighbourhood;
    } else {
        formattedAddress = data.display_name || 'Unknown Address';
    }

    return {
      address: formattedAddress,
      city: city
    };
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return { address: '', city: '' };
  }
};
