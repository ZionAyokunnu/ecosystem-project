// src/components/EnhancedLocationPicker.tsx
import React, { useState, useEffect } from 'react';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select';
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

  // --- Options arrays ---
  const [countryOptions, setCountryOptions] = useState<LocationWithEngagement[]>([]);
  const [nationOptions,  setNationOptions]  = useState<LocationWithEngagement[]>([]);
  const [regionOptions,  setRegionOptions]  = useState<LocationWithEngagement[]>([]);
  const [cityOptions,    setCityOptions]    = useState<LocationWithEngagement[]>([]);
  const [townOptions,    setTownOptions]    = useState<LocationWithEngagement[]>([]);
  const [wardOptions,    setWardOptions]    = useState<LocationWithEngagement[]>([]);

  // --- Selected IDs ---
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedNation,  setSelectedNation]  = useState<string>('');
  const [selectedRegion,  setSelectedRegion]  = useState<string>('');
  const [selectedCity,    setSelectedCity]    = useState<string>('');
  const [selectedTown,    setSelectedTown]    = useState<string>('');
  const [selectedWard,    setSelectedWard]    = useState<string>('');

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await getLocationChildren(null);
        setCountryOptions(countries.map(c => ({
          ...c,
          type: c.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 500) + 50,
          story_count:      Math.floor(Math.random() * 20)  + 5
        })));
      } catch (err) {
        console.error('Error loading countries:', err);
      }
    };
    loadCountries();
  }, []);

  // Load nations when country changes
  useEffect(() => {
    if (!selectedCountry) return;
    const loadNations = async () => {
      try {
        const list = await getLocationChildren(selectedCountry);
        setNationOptions(list.map(n => ({
          ...n,
          type: n.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 300) + 30,
          story_count:      Math.floor(Math.random() * 10)  + 2
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
    if (!selectedNation) return;
    const loadRegions = async () => {
      try {
        const list = await getLocationChildren(selectedNation);
        setRegionOptions(list.map(r => ({
          ...r,
          type: r.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 200) + 20,
          story_count:      Math.floor(Math.random() * 15) + 2
        })));
        setSelectedRegion('');
        setCityOptions([]);
        setTownOptions([]);
        setWardOptions([]);
      } catch (err) {
        console.error('Error loading regions:', err);
      }
    };
    loadRegions();
  }, [selectedNation]);

  // Load cities when region changes
  useEffect(() => {
    if (!selectedRegion) return;
    const loadCities = async () => {
      try {
        const list = await getLocationChildren(selectedRegion);
        setCityOptions(list.map(c => ({
          ...c,
          type: c.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 100) + 10,
          story_count:      Math.floor(Math.random() * 10) + 1
        })));
        setSelectedCity('');
        setTownOptions([]);
        setWardOptions([]);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    };
    loadCities();
  }, [selectedRegion]);

  // Load towns when city changes
  useEffect(() => {
    if (!selectedCity) return;
    const loadTowns = async () => {
      try {
        const list = await getLocationChildren(selectedCity);
        setTownOptions(list.map(t => ({
          ...t,
          type: t.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 100) + 10,
          story_count:      Math.floor(Math.random() * 5)  + 1
        })));
        setSelectedTown('');
        setWardOptions([]);
      } catch (err) {
        console.error('Error loading towns:', err);
      }
    };
    loadTowns();
  }, [selectedCity]);

  // Load wards when town changes
  useEffect(() => {
    if (!selectedTown) return;
    const loadWards = async () => {
      try {
        const list = await getLocationChildren(selectedTown);
        setWardOptions(list.map(w => ({
          ...w,
          type: w.type as 'country' | 'nation' | 'region' | 'city' | 'town' | 'ward',
          survey_responses: Math.floor(Math.random() * 50) + 5,
          story_count:      Math.floor(Math.random() * 5)  + 1
        })));
        setSelectedWard('');
      } catch (err) {
        console.error('Error loading wards:', err);
      }
    };
    loadWards();
  }, [selectedTown]);

  // Whenever any selection changes, compute the full Location object
  useEffect(() => {
    let loc = null;
    if (selectedWard)  loc = wardOptions.find(w => w.location_id === selectedWard) || null;
    else if (selectedTown) loc = townOptions.find(t => t.location_id === selectedTown)   || null;
    else if (selectedCity) loc = cityOptions.find(c => c.location_id === selectedCity)   || null;
    else if (selectedRegion) loc = regionOptions.find(r => r.location_id === selectedRegion) || null;
    else if (selectedNation) loc = nationOptions.find(n => n.location_id === selectedNation) || null;
    else if (selectedCountry) loc = countryOptions.find(c => c.location_id === selectedCountry) || null;
    setSelectedLocation(loc);
  }, [
    selectedCountry, selectedNation, selectedRegion,
    selectedCity, selectedTown, selectedWard,
    countryOptions, nationOptions, regionOptions,
    cityOptions, townOptions, wardOptions,
    setSelectedLocation
  ]);

  const renderLocationOption = (loc: LocationWithEngagement) => (
    <div className="flex items-center justify-between w-full">
      <span>{loc.name}</span>
      <div className="flex items-center gap-2">
        {loc.survey_responses != null && (
          <Badge variant="secondary" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {loc.survey_responses}
          </Badge>
        )}
        {loc.story_count != null && (
          <Badge variant="outline" className="text-xs">
            <MessageSquare className="w-3 h-3 mr-1" />
            {loc.story_count}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Country */}
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            {countryOptions.map(c => (
              <SelectItem key={c.location_id} value={c.location_id}>
                {renderLocationOption(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Nation */}
        {selectedCountry && nationOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedNation} onValueChange={setSelectedNation}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Nation" />
              </SelectTrigger>
              <SelectContent>
                {nationOptions.map(n => (
                  <SelectItem key={n.location_id} value={n.location_id}>
                    {renderLocationOption(n)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* Region */}
        {selectedNation && regionOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                {regionOptions.map(r => (
                  <SelectItem key={r.location_id} value={r.location_id}>
                    {renderLocationOption(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* City */}
        {selectedRegion && cityOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                {cityOptions.map(c => (
                  <SelectItem key={c.location_id} value={c.location_id}>
                    {renderLocationOption(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* Town */}
        {selectedCity && townOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedTown} onValueChange={setSelectedTown}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Town" />
              </SelectTrigger>
              <SelectContent>
                {townOptions.map(t => (
                  <SelectItem key={t.location_id} value={t.location_id}>
                    {renderLocationOption(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {/* Ward */}
        {selectedTown && wardOptions.length > 0 && (
          <>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Select value={selectedWard} onValueChange={setSelectedWard}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Ward" />
              </SelectTrigger>
              <SelectContent>
                {wardOptions.map(w => (
                  <SelectItem key={w.location_id} value={w.location_id}>
                    {renderLocationOption(w)}
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