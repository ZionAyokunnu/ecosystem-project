import React, { useState } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { Card } from './Card';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  label: string;
}

export function Select({ value, onValueChange, placeholder, children }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedChild = React.Children.toArray(children).find((child: any) => 
    child.props.value === value
  ) as React.ReactElement<SelectItemProps>;

  return (
    <>
      <Pressable 
        onPress={() => setIsOpen(true)}
        className="border border-gray-300 rounded-md p-3 bg-white"
      >
        <Text className={value ? "text-gray-900" : "text-gray-500"}>
          {selectedChild?.props.label || placeholder || "Select..."}
        </Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center p-4">
          <Card className="max-h-96">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold">Select Option</Text>
            </View>
            <ScrollView className="max-h-60">
              {React.Children.map(children, (child: any) => (
                <Pressable
                  key={child.props.value}
                  onPress={() => {
                    onValueChange(child.props.value);
                    setIsOpen(false);
                  }}
                  className="p-4 border-b border-gray-100"
                >
                  <Text className={child.props.value === value ? "text-blue-600 font-medium" : "text-gray-900"}>
                    {child.props.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
            <View className="p-4">
              <Button onPress={() => setIsOpen(false)}>
                Cancel
              </Button>
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}

Select.Item = function SelectItem({ value, label }: SelectItemProps) {
  return null;
};
