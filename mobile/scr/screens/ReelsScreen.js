import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  StyleSheet,
  StatusBar
} from 'react-native';
import { useTheme } from 'react-native-paper';
import ReelItem from '../components/ReelItem';
import api from '../services/api';

const { height: windowHeight } = Dimensions.get('window');

export default function ReelsScreen() {
  const theme = useTheme();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  const fetchReels = async () => {
    try {
      const response = await api.get('/reels');
      setReels(response.data);
    } catch (error) {
      console.error('Error fetching reels:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const renderReel = ({ item, index }) => (
    <ReelItem
      reel={item}
      isActive={index === currentIndex}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <FlatList
        ref={flatListRef}
        data={reels}
        renderItem={renderReel}
        keyExtractor={item => item._id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={windowHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
