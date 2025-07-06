
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/context/LocationContext';
import { getLocationChildren } from '@/services/locationApi'
import { Location } from '@/types';
import { ChevronRight } from 'lucide-react';

const LocationPicker: React.FC = () => {
  const { selectedLocation, setSelectedLocation } = useLocation();
  const [countryOptions, setCountryOptions] = useState<Location[]>([]);
  const [regionOptions, setRegionOptions] = useState<Location[]>([]);
  const [cityOptions, setCityOptions] = useState<Location[]>([]);
  const [wardOptions, setWardOptions] = useState<Location[]>([]);
  const [nationOptions, setNationOptions] = useState<Location[]>([]);
  const [townOptions, setTownOptions] = useState<Location[]>([]);
  
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');
  const [selectedNation, setSelectedNation] = useState<string>('');
  const [selectedTown, setSelectedTown] = useState<string>('');
  
  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getLocationChildren(null);
        setCountryOptions(countries.map(c => ({
          ...c,
          type: c.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          parent_id: c.parent_id || null
        })));
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    
    loadCountries();
  }, []);

  // Load nations when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    const loadNations = async () => {
      try {
        const nations = await getLocationChildren(selectedCountry);
        setNationOptions(nations.map(n => ({
          ...n,
          type: n.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          
        })));
        setSelectedNation('');
        setRegionOptions([]);
        setCityOptions([]);
        setTownOptions([]);
        setWardOptions([]);
      } catch (err) {
        console.error('Error loading nations:', err);
      }
    };
    loadNations();
  }, [selectedCountry]);
  
  // Load regions when nation changes
  useEffect(() => {
    if (selectedNation) {
      const loadRegions = async () => {
        try {
          const regions = await getLocationChildren(selectedNation);
          setRegionOptions(regions.map(r => ({
            ...r,
            type: r.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward'
          })));
          setSelectedRegion('');
          setCityOptions([]);
          setWardOptions([]);
          setTownOptions([]);
          setSelectedTown('');
        } catch (error) {
          console.error('Error loading regions:', error);
        }
      };
      loadRegions();
    }
  }, [selectedNation]);
  
  // Load cities when region changes
  useEffect(() => {
    if (selectedRegion) {
      const loadCities = async () => {
        try {
          const cities = await getLocationChildren(selectedRegion);
          setCityOptions(cities.map(c => ({
            ...c,
            type: c.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward'
          })));
          setSelectedCity('');
          setWardOptions([]);
          setTownOptions([]);
          setSelectedTown('');
        } catch (error) {
          console.error('Error loading cities:', error);
        }
      };
      loadCities();
    }
  }, [selectedRegion]);

  // Load towns when city changes
  useEffect(() => {
    if (!selectedCity) return;
    const loadTowns = async () => {
      try {
        const towns = await getLocationChildren(selectedCity);
        setTownOptions(towns.map(t => ({
          ...t,
          type: t.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward'
        })));
        setSelectedTown('');
        setWardOptions([]);
        setSelectedWard('');
      } catch (err) {
        console.error('Error loading towns:', err);
      }
    };
    loadTowns();
  }, [selectedCity]);
  
  // Load wards when town changes
  useEffect(() => {
    if (selectedTown) {
      const loadWards = async () => {
        try {
          const wards = await getLocationChildren(selectedTown);
          setWardOptions(wards.map(w => ({
            ...w,
            type: w.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward'
          })));
          setSelectedWard('');
        } catch (error) {
          console.error('Error loading wards:', error);
        }
      };
      loadWards();
    }
  }, [selectedTown]);
  
  // Update selected location when selections change
  useEffect(() => {
    const getSelectedLocation = () => {
      if (selectedWard) {
        return wardOptions.find(w => w.location_id === selectedWard) || null;
      }
      if (selectedTown) {
        return townOptions.find(t => t.location_id === selectedTown) || null;
      }
      if (selectedCity) {
        return cityOptions.find(c => c.location_id === selectedCity) || null;
      }
      if (selectedRegion) {
        return regionOptions.find(r => r.location_id === selectedRegion) || null;
      }
      if (selectedNation) {
        return nationOptions.find(n => n.location_id === selectedNation) || null;
      }
      if (selectedCountry) {
        return countryOptions.find(c => c.location_id === selectedCountry) || null;
      }
      return null;
    };
    
    const location = getSelectedLocation();
    setSelectedLocation(location);
  }, [
    selectedCountry,
    selectedRegion,
    selectedCity,
    selectedWard,
    selectedNation,
    selectedTown,
    countryOptions,
    regionOptions,
    cityOptions,
    wardOptions,
    nationOptions,
    townOptions,
    setSelectedLocation
  ]);
  
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

      {selectedCountry && nationOptions.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Select value={selectedNation} onValueChange={setSelectedNation}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Nation" />
            </SelectTrigger>
            <SelectContent>
              {nationOptions.map(n => (
                <SelectItem key={n.location_id} value={n.location_id}>
                  {n.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {selectedNation && regionOptions.length > 0 && (
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

      {selectedCity && townOptions.length > 0 && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Select value={selectedTown} onValueChange={setSelectedTown}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Town" />
            </SelectTrigger>
            <SelectContent>
              {townOptions.map(t => (
                <SelectItem key={t.location_id} value={t.location_id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {selectedTown && wardOptions.length > 0 && (
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
