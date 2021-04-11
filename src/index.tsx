import React, {ReactNode, useState} from 'react';
import {
  View,
  Text,
  ScrollViewProps,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated
} from 'react-native';


export interface Props extends ScrollViewProps {
  data: any[],
  renderItem: (item: any, index: number) => ReactNode,
  itemWidth: number,
  initialIndex?: number,
  onChange?: (position: number) => void,
  mark?: ReactNode | null,
  interpolateScale?: (index: number, itemWidth: number) => Animated.InterpolationConfigType,
  interpolateOpacity?: (index: number, itemWidth: number) => Animated.InterpolationConfigType
  style?: object,
  passToFlatList?: object
}


export default (props: Props) => {
  const {
    data,
    renderItem,
    itemWidth,
    style = {},
    passToFlatList = {},
    ...passedProps
  } = props;

  const scrollX = React.useRef(new Animated.Value(0)).current;
  const flatListRef = React.useRef(null);
  let [paddingSide, setPaddingSide] = useState(0);

  const onLayoutScrollView = (e: LayoutChangeEvent) => {
    const {width} = e.nativeEvent.layout;
    const {itemWidth, onLayout, initialIndex} = props;
    setPaddingSide((width - itemWidth) / 2);

    if (onLayout != null) {
      onLayout(e);
    }
    if (initialIndex) {
      scrollToPosition(initialIndex);
    }
  }

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const selected = Math.round(x / itemWidth);
    changePosition(selected);
    scrollToPosition(selected);
  }

  const scrollToPosition = (position: number) => {
    if (flatListRef && flatListRef.current) {
      // @ts-ignore
      flatListRef.current.scrollToIndex({animated: true, index: "" + position});
    }
  }

  const changePosition = (position: number) => {
    const {onChange} = props;
    if (onChange != null) {
      if (position < 1) {
        onChange(0);
      } else if (position > props.data.length) {
        onChange(props.data.length - 1);
      } else {
        onChange(position);
      }
    }
  }

  return (
    <View style={{display: "flex", height: "100%", ...style}} {...passedProps}>
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center'
      }}>
        {typeof props.mark === "undefined" ? DefaultMark : props.mark}
      </View>
      <Animated.FlatList
        ref={process.env.NODE_ENV === 'test' ? null : flatListRef}
        onLayout={onLayoutScrollView}
        onScroll={Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}],
          {useNativeDriver: true})}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(_item, index) => index.toString()}
        onMomentumScrollEnd={onMomentumScrollEnd}
        contentContainerStyle={{
          paddingHorizontal: paddingSide, display: "flex", alignItems: "center", backgroundColor: 'transparent'
        }}
        {...passToFlatList}
        renderItem={({item, index}) => {
          const {itemWidth, interpolateScale, interpolateOpacity} = props;

          const scale = scrollX.interpolate(interpolateScale ?
            interpolateScale(index, itemWidth) :
            defaultScaleConfig(index, itemWidth));

          const opacity = scrollX.interpolate(interpolateOpacity ?
            interpolateOpacity(index, itemWidth) :
            defaultOpacityConfig(index, itemWidth));

          return (
            <TouchableWithoutFeedback onPress={() => {
              changePosition(index);
              scrollToPosition(index);
            }} key={index}>
              <Animated.View style={{transform: [{scale}], opacity}}>
                {renderItem(item, index)}
              </Animated.View>
            </TouchableWithoutFeedback>
          )
        }}/>
    </View>
  );
}

const DefaultMark =
  <Text style={{
    color: "black",
    fontWeight: "bold",
    paddingTop: 60
  }}>^</Text>;

const defaultScaleConfig = (index: number, itemWidth: number) => ({
  inputRange: [
    itemWidth * (index - 2),
    itemWidth * (index - 1),
    itemWidth * index,
    itemWidth * (index + 1),
    itemWidth * (index + 2),
  ],
  outputRange: [1, 1.5, 2.2, 1.5, 1]
});

const defaultOpacityConfig = (index: number, itemWidth: number) => ({
  inputRange: [
    itemWidth * (index - 2),
    itemWidth * (index - 1),
    itemWidth * index,
    itemWidth * (index + 1),
    itemWidth * (index + 2),
  ],
  outputRange: [0.7, 0.9, 1, 0.9, 0.7]
});
