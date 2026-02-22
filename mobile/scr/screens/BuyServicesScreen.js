import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
  Alert
} from 'react-native';
import {
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  TextInput,
  RadioButton,
  Text,
  useTheme
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function BuyServicesScreen({ navigation, route }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { postId, postUser } = route.params || {};
  
  const [serviceType, setServiceType] = useState('likes');
  const [quantity, setQuantity] = useState('100');
  const [loading, setLoading] = useState(false);

  const servicePrices = {
    likes: { 100: 5, 500: 20, 1000: 35 },
    views: { 100: 3, 500: 12, 1000: 20 },
    comments: { 100: 10, 500: 40, 1000: 70 },
    followers: { 100: 8, 500: 30, 1000: 50 }
  };

  const getPrice = () => {
    const prices = servicePrices[serviceType];
    return prices[quantity] || 0;
  };

  const handleBuyNow = async () => {
    try {
      setLoading(true);
      
      // Create purchase record
      const purchase = await api.post('/services/purchase', {
        serviceType,
        targetPost: postId,
        targetUser: serviceType === 'followers' ? postUser : null,
        quantity: parseInt(quantity),
        amount: getPrice()
      });

      // WhatsApp link
      const phoneNumber = '923437226308';
      const message = encodeURIComponent(
        `Hi, I want to buy ${quantity} ${serviceType} for $${getPrice()}. ` +
        `Purchase ID: ${purchase.data._id}`
      );
      
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
      
      // Open WhatsApp
      const supported = await Linking.canOpenURL(whatsappUrl);
      
      if (supported) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert('Error', 'WhatsApp is not installed');
      }
      
    } catch (error) {
      console.error('Purchase error:', error);
      Alert.alert('Error', 'Failed to process purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Buy Services" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Choose Service</Title>
            
            <RadioButton.Group
              onValueChange={value => setServiceType(value)}
              value={serviceType}
            >
              <RadioButton.Item label="Likes" value="likes" />
              <RadioButton.Item label="Views" value="views" />
              <RadioButton.Item label="Comments" value="comments" />
              <RadioButton.Item label="Followers" value="followers" />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Select Quantity</Title>
            
            <RadioButton.Group
              onValueChange={value => setQuantity(value)}
              value={quantity}
            >
              <RadioButton.Item label="100 - $5" value="100" />
              <RadioButton.Item label="500 - $20" value="500" />
              <RadioButton.Item label="1000 - $35" value="1000" />
            </RadioButton.Group>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Summary</Title>
            
            <View style={styles.summaryRow}>
              <Text>Service:</Text>
              <Text style={styles.summaryValue}>{serviceType}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text>Quantity:</Text>
              <Text style={styles.summaryValue}>{quantity}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text>Total:</Text>
              <Text style={styles.totalPrice}>${getPrice()}</Text>
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleBuyNow}
          loading={loading}
          disabled={loading}
          style={[styles.buyButton, { backgroundColor: '#25D366' }]}
          icon="whatsapp"
        >
          Buy Now via WhatsApp
        </Button>
        
        <Paragraph style={styles.note}>
          You will be redirected to WhatsApp to complete your purchase.
          Our team will assist you with the payment process.
        </Paragraph>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  summaryValue: {
    fontWeight: '500',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#25D366',
  },
  buyButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
