
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/context/LocationContext';
import { getLocationChildren } from '@/services/locationApi';
import { Location } from '@/types';
import { ChevronRight } from 'lucide-react';

const LocationPicker: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const [countryOptions, setCountryOptions] = useState<Location[]>([]);
  const [regionOptions, setRegionOptions] = useState<Location[]>([]);
  const [cityOptions, setCityOptions] = useState<Location[]>([]);
  const [wardOptions, setWardOptions] = useState<Location[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getLocationChildren(null);
        setCountryOptions(countries);
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    
    loadCountries();
  }, []);
  
  // Load regions when country changes
  useEffect(() => {
    if (selectedCountry) {
      const loadRegions = async () => {
        try {
          const regions = await getLocationChildren(selectedCountry);
          setRegionOptions(regions);
          setSelectedRegion('');
          setCityOptions([]);
          setWardOptions([]);
        } catch (error) {
          console.error('Error loading regions:', error);
        }
      };
      
      loadRegions();
    }
  }, [selectedCountry]);
  
  // Load cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      const loadCities = async () => {
        try {
          const cities = await getLocationChildren(selectedRegion);
          setCityOptions(cities);
          setSelectedCity('');
          setWardOptions([]);
        } catch (error) {
          console.error('Error loading cities:', error);
        }
      };
      
      loadCities();
    }
  }, [selectedRegion]);
  
  // Load wards when city changes
  useEffect(() => {
    if (selectedCity) {
      const loadWards = async () => {
        try {
          const wards = await getLocationChildren(selectedCity);
          setWardOptions(wards);
          setSelectedWard('');
        } catch (error) {
          console.error('Error loading wards:', error);
        }
      };
      
      loadWards();
    }
  }, [selectedCity]);
  
  // Update selected location when selections change
  useEffect(() => {
    const getSelectedLocation = () => {
      if (selectedWard) {
        return wardOptions.find(w => w.location_id === selectedWard) || null;
      }
      if (selectedCity) {
        return cityOptions.find(c => c.location_id === selectedCity) || null;
      }
      if (selectedRegion) {
        return regionOptions.find(r => r.location_id === selectedRegion) || null;
      }
      if (selectedCountry) {
        return countryOptions.find(c => c.location_id === selectedCountry) || null;
      }
      return null;
    };
    
    const location = getSelectedLocation();
    setSelectedLocation(location);
  }, [selectedCountry, selectedRegion, selectedCity, selectedWard, countryOptions, regionOptions, cityOptions, wardOptions, setSelectedLocation]);
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Select value={selectedCountry} onValueChange={setSelectedCountry}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          {countryOptions.map((country) => (
            <SelectItem key={country.location_id} value={country.location_id}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedCountry && regionOptions.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map((region) => (
                <SelectItem key={region.location_id} value={region.location_id}>
                  {region.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      
      {selectedRegion && cityOptions.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city.location_id} value={city.location_id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
      
      {selectedCity && wardOptions.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Select value={selectedWard} onValueChange={setSelectedWard}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Ward" />
            </SelectTrigger>
            <SelectContent>
              {wardOptions.map((ward) => (
                <SelectItem key={ward.location_id} value={ward.location_id}>
                  {ward.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  );
};

export default LocationPicker;