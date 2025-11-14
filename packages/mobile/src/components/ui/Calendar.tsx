import React, { useState } from 'react';
import { View, Modal, Platform } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from './Button';
import { Text } from './Text';
import { Card } from './Card';
import { cn } from '@/lib/utils';

interface CalendarProps {
  value?: Date;
  onDateChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
}

export function Calendar({ 
  value, 
  onDateChange, 
  mode = 'date',
  placeholder = 'Select date',
  className,
  minDate,
  maxDate 
}: CalendarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date());

  const handleDateSelect = (dateData: DateData) => {
    const selectedDate = new Date(dateData.timestamp);
    setTempDate(selectedDate);
    
    if (mode === 'date') {
      onDateChange(selectedDate);
      setIsVisible(false);
    }
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setIsVisible(false);
  };

  const formatDate = (date?: Date) => {
    if (!date) return placeholder;
    
    switch (mode) {
      case 'date':
        return date.toLocaleDateString();
      case 'time':
        return date.toLocaleTimeString();
      case 'datetime':
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      default:
        return date.toLocaleDateString();
    }
  };

  if (Platform.OS === 'ios') {
    return (
      <>
        <Button
          variant="outline"
          onPress={() => setIsVisible(true)}
          className={cn("justify-start", className)}
        >
          <Text className={value ? "text-gray-900" : "text-gray-500"}>
            {formatDate(value)}
          </Text>
        </Button>

        <Modal visible={isVisible} transparent animationType="slide">
          <View className="flex-1 bg-black/50 justify-end">
            <Card className="rounded-t-xl">
              <View className="p-4 border-b border-gray-200">
                <Text className="text-lg font-semibold text-center">
                  Select {mode === 'datetime' ? 'Date & Time' : mode}
                </Text>
              </View>
              
              <View className="p-4">
                {(mode === 'date' || mode === 'datetime') && (
                  <RNCalendar
                    current={tempDate.toISOString().split('T')[0]}
                    onDayPress={handleDateSelect}
                    minDate={minDate?.toISOString().split('T')[0]}
                    maxDate={maxDate?.toISOString().split('T')[0]}
                    theme={{
                      selectedDayBackgroundColor: '#3b82f6',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#3b82f6',
                      dayTextColor: '#2d3748',
                      textDisabledColor: '#a0aec0',
                      monthTextColor: '#2d3748',
                      arrowColor: '#3b82f6',
                    }}
                  />
                )}

                {(mode === 'time' || mode === 'datetime') && (
                  <DateTimePicker
                    value={tempDate}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setTempDate(selectedDate);
                    }}
                  />
                )}
              </View>

              <View className="flex-row p-4 space-x-4">
                <Button
                  variant="outline"
                  onPress={() => setIsVisible(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleConfirm}
                  className="flex-1"
                >
                  Confirm
                </Button>
              </View>
            </Card>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onPress={() => setIsVisible(true)}
        className={cn("justify-start", className)}
      >
        <Text className={value ? "text-gray-900" : "text-gray-500"}>
          {formatDate(value)}
        </Text>
      </Button>

      {isVisible && (
        <DateTimePicker
          value={tempDate}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={(event, selectedDate) => {
            setIsVisible(false);
            if (selectedDate) {
              onDateChange(selectedDate);
            }
          }}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      )}
    </>
  );
}
