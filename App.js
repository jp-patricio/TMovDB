/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import Login from "./screens/login/login";
import Home from "./screens/Home/Home";
import Movie from "./screens/Movie/Movie";
import { TouchableOpacity } from "react-native-gesture-handler";
import axios from "axios";
import PersistentData from "./PersistentData";

const AppNavigator = createStackNavigator(
  {
    Login: {
      screen: Login,
      navigationOptions: {
        title: "Login",
        header: null
      }
    },
    Home: {
      screen: Home,
      navigationOptions :({navigation})=> {return{
        title:"TMDB",
        headerLeft:null,
        headerStyle: {
          backgroundColor: "#071729"
        },
        headerTintColor: "#01D277",
        headerTitleStyle: {
          color: "white"
        },
        headerRight: (
          <TouchableOpacity
            onPress={() => {
              var persistentData = new PersistentData();
              persistentData.getData("sessionId").then(id => {
                console.log(id);
                axios
                  .delete(
                    "https://api.themoviedb.org/3/authentication/session?api_key=d4c1e78ac700d5161b065701ce386aff",
                    {
                      data: {
                        session_id: id
                      }
                    }
                  )
                  .then(data => {
                    console.log(data);
                    if (data.data.success) {
                      persistentData
                        .deleteData()
                        .then(() => {
                          console.log("NAVIGAAATE");
                          navigation.navigate("Login");
                        })
                        .catch(e => {
                          console.log(e);
                        });
                      // navigate('Login')
                    }
                  });
              });
            }}
          >
            <Text style={{ marginHorizontal: 20, color: "white" }}>LOGOUT</Text>
          </TouchableOpacity>
        )
      }}
    },
    Movie: {
      screen: Movie,
      navigationOptions: {
        title: "Movie"
      }
    }
  },
  {
    initialRouteName: "Login"
  }
);

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
