
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLocation } from '@/context/LocationContext';
import { getLocationChildren } from '@/services/locationApi';
import { Location } from '@/types';
import { ChevronRight, Users, MessageSquare } from 'lucide-react';

interface LocationWithEngagement extends Location {
  survey_responses?: number;
  story_count?: number;
}

const EnhancedLocationPicker: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const [countryOptions, setCountryOptions] = useState<LocationWithEngagement[]>([]);
  const [regionOptions, setRegionOptions] = useState<LocationWithEngagement[]>([]);
  const [cityOptions, setCityOptions] = useState<LocationWithEngagement[]>([]);
  const [wardOptions, setWardOptions] = useState<LocationWithEngagement[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  
  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getLocationChildren(null);
        // Mock engagement data for demonstration
        const countriesWithEngagement = countries.map(country => ({
          ...country,
          survey_responses: Math.floor(Math.random() * 500) + 50,
          story_count: Math.floor(Math.random() * 20) + 5
        }));
        setCountryOptions(countriesWithEngagement);
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
          const regionsWithEngagement = regions.map(region => ({
            ...region,
            survey_responses: Math.floor(Math.random() * 200) + 20,
            story_count: Math.floor(Math.random() * 15) + 2
          }));
          setRegionOptions(regionsWithEngagement);
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
          const citiesWithEngagement = cities.map(city => ({
            ...city,
            survey_responses: Math.floor(Math.random() * 100) + 10,
            story_count: Math.floor(Math.random() * 10) + 1
          }));
          setCityOptions(citiesWithEngagement);
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
          const wardsWithEngagement = wards.map(ward => ({
            ...ward,
            survey_responses: Math.floor(Math.random() * 50) + 5,
            story_count: Math.floor(Math.random() * 5) + 1
          }));
          setWardOptions(wardsWithEngagement);
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

  const renderLocationOption = (location: LocationWithEngagement) => (
    <div className="flex items-center justify-between w-full">
      <span>{location.name}</span>
      <div className="flex items-center gap-2">
        {location.survey_responses && (
          <Badge variant="secondary" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {location.survey_responses}
          </Badge>
        )}
        {location.story_count && (
          <Badge variant="outline" className="text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            {location.story_count}
          </Badge>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map((country) => (
              <SelectItem key={country.location_id} value={country.location_id}>
                {renderLocationOption(country)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedCountry && regionOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map((region) => (
                  <SelectItem key={region.location_id} value={region.location_id}>
                    {renderLocationOption(region)}
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map((city) => (
                  <SelectItem key={city.location_id} value={city.location_id}>
                    {renderLocationOption(city)}
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
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                {wardOptions.map((ward) => (
                  <SelectItem key={ward.location_id} value={ward.location_id}>
                    {renderLocationOption(ward)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}
      </div>
      
      {selectedLocation && (
        <div className="text-sm text-gray-600">
          <p>Community engagement data shows active participation in this area</p>
        </div>
      )}
    </div>
  );
};

export default EnhancedLocationPicker;