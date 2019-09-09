import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Image
} from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  StackActions,
  NavigationActions
} from "react-navigation";
import PersistentData from "../../PersistentData";
import axios from "axios";

type Props = {};
const resetAction = StackActions.reset({
  index: 0,
  actions: [NavigationActions.navigate({ routeName: "Home" })]
});
export default class Login extends Component<Props> {
  persistentData = new PersistentData();
  username = "";
  password = "";
  state = {
    username: "",
    password: "",
    requestToken: "",
    sendLogin: false
  };
  getToken() {
    return axios.get(
      "https://api.themoviedb.org/3/authentication/token/new?api_key=d4c1e78ac700d5161b065701ce386aff"
    );
  }
  login() {
    this.setState({ sendLogin: true });
    axios
      .post(
        "https://api.themoviedb.org/3/authentication/token/validate_with_login?api_key=d4c1e78ac700d5161b065701ce386aff",
        {
          username: this.state.username,
          password: this.state.password,
          request_token: this.state.requestToken
        }
      )
      .then(data => {
        this.setState({ sendLogin: false });
        console.log("LOGIN", data);
        if (data.data.success) {
          this.createSession();
        } else {
          Alert.alert("Error", data.data.status_message);
        }
        return null;
      })
      .catch(error => {
        console.log(error.response);
        if (error.response.data) {
          Alert.alert("Error", error.response.data.status_message);
          this.setState({ sendLogin: false });
        }
      });
  }

  createSession() {
    axios
      .post(
        "https://api.themoviedb.org/3/authentication/session/new?api_key=d4c1e78ac700d5161b065701ce386aff",
        {
          request_token: this.state.requestToken
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          }
        }
      )
      .then(data => {
        if (data.data.success) {
          this.persistentData
            .save("sessionId", data.data.session_id)
            .then(() => {
              // this.props.navigation.navigate('Home')
              this.props.navigation.dispatch(resetAction);
            });
        }
      });
  }
  constructor() {
    super();
    this.persistentData.getData("sessionId").then(data => {
      if (data != null) {
        this.props.navigation.navigate("Home");
      }
    });
    this.getToken().then(data => {
      if (data.data.success) {
        this.setState({ requestToken: data.data.request_token });
      }
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={{
              uri:
                "https://upload.wikimedia.org/wikipedia/commons/6/6e/Tmdb-312x276-logo.png"
            }}
          ></Image>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            textContentType="username"
            placeholder="Username"
            placeholderTextColor="#718195"
            style={styles.input}
            onChangeText={text => {
              this.setState({ username: text });
            }}
          ></TextInput>
          <TextInput
            textContentType="password"
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor="#718195"
            style={styles.input}
            onChangeText={text => {
              this.setState({ password: text });
            }}
          ></TextInput>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => {
              this.login();
            }}
          >
            {this.state.sendLogin ? (
              <ActivityIndicator size="small" color="#fff"></ActivityIndicator>
            ) : (
              <Text style={styles.loginBtnTxt}>LOGIN</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#081C23",
    flexDirection: "column"
  },
  logoContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    width: 160,
    height: 140
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    flex: 1
  },
  input: {
    marginTop: 10,
    width: "80%",
    backgroundColor: "#1b4554",
    borderRadius: 50,
    paddingHorizontal: 20,
    height: 45,
    color: "white"
  },
  loginBtn: {
    backgroundColor: "#01D277",
    width: "80%",
    alignItems: "center",
    marginTop: 30,
    borderRadius: 50,
    paddingVertical: 13
  },
  loginBtnTxt: {
    color: "white",
    fontWeight: "bold",

    fontSize: 15
  }
});
