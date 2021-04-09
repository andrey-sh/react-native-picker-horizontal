import * as React from "react";
import { create, act } from "react-test-renderer";
import { View } from "react-native";

import ValuePicker from "../src";

const Items = Array.from(Array(10).keys());

const rednerItem = (item) => (
  <View style={{ width: 50 }}>
      { item }
  </View>
);

const mockCallback = jest.fn(x => x);

const tree = create(<ValuePicker
  data={Items}
  renderItem={rednerItem}
  itemWidth={50}
  initialIndex={1}
  onChange={mockCallback}
/>).toJSON();


it(`renders correctly`, () => {
  expect(tree).toMatchSnapshot();
});

const slider = tree.children[1].children[0];

it(`render all items`, () => {
  expect(slider.children.length).toBe(10);
});

act(() => {
  slider.children[3].children[0].props.onClick();
});

it(`onChange calls by click`, () => {
  expect(mockCallback.mock.calls.length).toBe(1);
});

it(`onChange return right value`, () => {
  expect(mockCallback.mock.calls[0][0]).toBe(3);
});