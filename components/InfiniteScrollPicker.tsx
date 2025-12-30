import { useTheme } from '@/context/ThemeContext';
import React, { useRef } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface InfiniteScrollPickerProps {
  data: number[];
  value: number;
  onValueChange: (value: number) => void;
  itemHeight?: number;
  height?: number;
}

const MIN_ITEMS_TO_RENDER = 1000; // Target number of items for infinite feel

export function InfiniteScrollPicker({
  data,
  value,
  onValueChange,
  itemHeight = 40,
  height = 200,
}: InfiniteScrollPickerProps) {
  const { colors } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  // Create a large dataset: Middle sets are safe for scrolling
  // Optimize: Don't create tens of thousands of items if data is already large
  const extendedData = React.useMemo(() => {
    if (data.length === 0) return [];
    
    const repeatCount = data.length < MIN_ITEMS_TO_RENDER 
        ? Math.ceil(MIN_ITEMS_TO_RENDER / data.length) 
        : 3; // Minimal repeats if list is already huge
        
    let arr: number[] = [];
    for (let i = 0; i < repeatCount; i++) {
        arr = [...arr, ...data];
    }
    return { data: arr, repeatCount };
  }, [data]);

  const halfHeight = height / 2;
  const initIndex = data.indexOf(value);
  // Start in the middle set of data
  // Use the calculated repeatCount from memo
  const initialScrollIndex = (Math.floor(extendedData.repeatCount / 2) * data.length) + (initIndex !== -1 ? initIndex : 0);

  // We only set the initial scroll once on mount to avoid jumping around during rapid updates
  // For controlled updates, additional logic would be needed, but for a picker this is usually fine.

  const getItemLayout = (_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / itemHeight);
    
    // Calculate actual value from the extended array
    if (extendedData.data.length > 0) {
        const realIndex = index % data.length;
        const newValue = data[realIndex];
        
        if (newValue !== value) {
            onValueChange(newValue);
        }
    }
  };

  return (
    <View style={{ height, width: '100%' }}>
      {/* Selection Overlay */}
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {
            top: halfHeight - itemHeight / 2,
            height: itemHeight,
            borderColor: colors.primary,
          },
        ]}
      />
      
      <FlatList
        ref={flatListRef}
        data={extendedData.data}
        keyExtractor={(item, index) => `${index}-${item}`}
        renderItem={({ item }) => (
          <View style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, color: colors.text }}>{item}</Text>
          </View>
        )}
        getItemLayout={getItemLayout}
        initialScrollIndex={initialScrollIndex}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: halfHeight - itemHeight / 2,
          paddingBottom: halfHeight - itemHeight / 2,
        }}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    opacity: 0.3,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});
