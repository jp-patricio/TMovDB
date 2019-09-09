import AsyncStorage from "@react-native-community/async-storage";
import React, { Component } from "react";
import axios from "axios";

export default class PersistentData extends Component<Props> {
  async save(key, val) {
    try {
      await AsyncStorage.setItem(key, val);
    } catch (e) {
      console.log(e);
    }
  }
  async getData(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value == null) {
        this.props.navigation.navigate("Splash");
      }
      return value;
    } catch (e) {
      // error reading value
    }
  }
  async deleteData(key) {
    try {
      await AsyncStorage.clear();
      this.props.navigation.navigate("Login");
    } catch (e) {
      // error reading value
    }
  }
}
