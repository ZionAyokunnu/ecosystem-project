import React, { useState, useEffect } from 'react';
import { View, FlatList, Alert, Pressable } from 'react-native';
import * as Contacts from 'expo-contacts';
import * as SMS from 'expo-sms';
import * as MailComposer from 'expo-mail-composer';
import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { AnimatedPressable } from '@/src/components/ui/AnimatedComponents';
import { Search } from '@/src/components/ui/Search';
import { useAuth } from '@ecosystem/shared';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: string[];
  emails?: string[];
  imageUri?: string;
}

interface ContactInviteProps {
  onInviteSent?: (contact: Contact, method: string) => void;
  maxInvites?: number;
}

export function ContactInvite({ onInviteSent, maxInvites = 10 }: ContactInviteProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState(false);
  const [invitesSent, setInvitesSent] = useState(0);
  
  const { profile } = useAuth();

  useEffect(() => {
    requestContactPermission();
  }, []);

  const requestContactPermission = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setPermission(status === 'granted');
      
      if (status === 'granted') {
        loadContacts();
      }
    } catch (error) {
      console.error('Contact permission error:', error);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const formattedContacts: Contact[] = data
        .filter(contact => contact.name)
        .map(contact => ({
          id: contact.id!,
          name: contact.name!,
          phoneNumbers: contact.phoneNumbers?.map(p => p.number) || [],
          emails: contact.emails?.map(e => e.email) || [],
        }))
        .slice(0, 100);

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      console.error('Load contacts error:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const generateInviteMessage = (contact: Contact, method: 'sms' | 'email') => {
    const userName = profile?.first_name || 'Your friend';
    const personalMessage = `Hi ${contact.name.split(' ')[0]}! 👋`;
    
    const baseMessage = method === 'sms' 
      ? `${personalMessage} Join me on this amazing community platform where we learn, grow, and make real impact together! 🚀`
      : `${personalMessage}\n\nI've been using this incredible community engagement platform and thought you'd love it too!`;

    return {
      subject: method === 'email' ? '🌟 Join me in building stronger communities!' : undefined,
      message: baseMessage,
      url: 'https://your-app-link.com',
    };
  };

  const inviteViaSMS = async (contact: Contact) => {
    if (!contact.phoneNumbers?.length) {
      Alert.alert('No Phone Number', 'This contact has no phone numbers');
      return;
    }

    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('SMS Not Available', 'SMS is not available on this device');
        return;
      }

      const inviteData = generateInviteMessage(contact, 'sms');
      const fullMessage = `${inviteData.message}\n\n${inviteData.url}`;

      await SMS.sendSMSAsync(contact.phoneNumbers, fullMessage);
      
      setInvitesSent(prev => prev + 1);
      onInviteSent?.(contact, 'sms');
      Alert.alert('Invite Sent! 🎉', `SMS invitation sent to ${contact.name}`);
      
    } catch (error) {
      console.error('SMS invite error:', error);
      Alert.alert('Error', 'Failed to send SMS invite');
    }
  };

  const renderContact = ({ item: contact }: { item: Contact }) => (
    <AnimatedPressable onPress={() => {}}>
      <Card className="p-4 mb-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center mr-3">
              <Text className="text-lg">{contact.name[0].toUpperCase()}</Text>
            </View>
            
            <View className="flex-1">
              <Text className="font-semibold">{contact.name}</Text>
              <View className="flex-row flex-wrap">
                {contact.phoneNumbers?.length > 0 && (
                  <Badge variant="outline" className="mr-1">
                    📱 {contact.phoneNumbers.length}
                  </Badge>
                )}
              </View>
            </View>
          </View>

          {contact.phoneNumbers?.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onPress={() => inviteViaSMS(contact)}
            >
              SMS
            </Button>
          )}
        </View>
      </Card>
    </AnimatedPressable>
  );

  if (!permission) {
    return (
      <Card className="p-6">
        <View className="items-center">
          <Text className="text-6xl mb-4">👥</Text>
          <Text className="text-xl font-bold mb-2">Invite Your Friends</Text>
          <Text className="text-gray-600 text-center mb-6">
            Share the learning journey with people you care about
          </Text>
          <Button onPress={requestContactPermission}>
            Access Contacts
          </Button>
        </View>
      </Card>
    );
  }

  return (
    <View className="flex-1">
      <Card className="p-6 mb-4">
        <View className="items-center mb-4">
          <Text className="text-4xl mb-2">🌟</Text>
          <Text className="text-xl font-bold">Spread the Growth</Text>
          <Text className="text-gray-600 text-center">
            Invite friends to join your learning community
          </Text>
        </View>

        <View className="bg-gray-50 rounded-lg p-4">
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="font-bold text-lg text-green-600">{invitesSent}</Text>
              <Text className="text-xs text-gray-500">Invites Sent</Text>
            </View>
            <View className="items-center">
              <Text className="font-bold text-lg text-purple-600">{contacts.length}</Text>
              <Text className="text-xs text-gray-500">Contacts</Text>
            </View>
          </View>
        </View>
      </Card>

      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-8">
            <Text className="text-gray-500">
              {loading ? 'Loading contacts...' : 'No contacts found'}
            </Text>
          </View>
        }
      />
    </View>
  );
}
