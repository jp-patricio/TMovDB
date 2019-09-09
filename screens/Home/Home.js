import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity
} from "react-native";
import {
  createStackNavigator,
  createAppContainer,
  createBottomTabNavigator
} from "react-navigation";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import Watchlist from "../Watchlist/Watchlist";

type Props = {};
class Home extends Component<Props> {
  state = {
    trending: [],
    refreshing: false,
    search: [],
    searchQuery: "",
    searchEnabled: false
  };
  getTrending() {
    this.setState({ refreshing: true });
    axios
      .get(
        "https://api.themoviedb.org/3/trending/movie/day?api_key=d4c1e78ac700d5161b065701ce386aff"
      )
      .then(data => {
        console.log(data);
        this.setState({ trending: data.data.results });
        this.setState({ refreshing: false });
      });
  }
  componentDidMount() {
    this.getTrending();
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, styles.whiteText]}>Movies</Text>
        <TextInput
          placeholderTextColor="#718195"
          placeholder="Search"
          style={styles.search}
          value={this.state.searchQuery}
          onChangeText={text => {
            this.setState({ searchEnabled: true, searchQuery: text });
            console.log(this.state.searchQuery);
            axios
              .get(
                "https://api.themoviedb.org/3/search/movie?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US&query=" +
                  text +
                  "&page=1&include_adult=false"
              )
              .then(data => {
                this.setState({ search: data.data.results });
              })
              .catch(e => {
                console.log(e);
              });
          }}
        ></TextInput>

        {this.state.searchEnabled ? (
          <View
            style={{ flex: 1, justifyContent: "flex-start", width: "100%" }}
          >
            <TouchableOpacity
              style={styles.btnLink}
              onPress={() => {
                this.setState({ searchQuery: "", searchEnabled: false });
              }}
            >
              <Text style={styles.link}>VIEW TRENDING MOVIES</Text>
            </TouchableOpacity>
            <Text style={[styles.trending, styles.whiteText]}>
              SEARCH RESULTS
            </Text>
            <FlatList
              keyExtractor={item => item.id}
              style={styles.trendingList}
              data={this.state.search}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={styles.movieTile}
                    onPress={() => {
                      this.props.navigation.navigate("Movie", { id: item.id });
                    }}
                  >
                    <Image
                      style={styles.moviePoster}
                      source={{
                        uri:
                          "https://image.tmdb.org/t/p/w500" + item.poster_path
                      }}
                    ></Image>
                    <View style={styles.movieDetails}>
                      <Text
                        numberOfLines={3}
                        style={[styles.whiteText, styles.movieTitle]}
                      >
                        {item.original_title != null
                          ? item.original_title
                          : item.original_name}
                      </Text>
                      <Text style={styles.mutedText}>
                        {item.release_date != null
                          ? "Release Date"
                          : "First Air Date"}{" "}
                        :{" "}
                        {item.release_date != null
                          ? item.release_date
                          : item.first_air_date}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon name="star" size={13} color="#faad14" />
                        <Text style={[styles.mutedText, styles.smallText]}>
                          {item.vote_average}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            ></FlatList>
          </View>
        ) : (
          <View style={{ flex: 1, width: "100%" }}>
            <Text style={[styles.trending, styles.whiteText]}>TRENDING</Text>
            <FlatList
              refreshing={this.state.refreshing}
              keyExtractor={item => item.poster_path}
              onRefresh={() => {
                this.getTrending();
              }}
              style={styles.trendingList}
              data={this.state.trending}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={styles.movieTile}
                    onPress={() => {
                      this.props.navigation.navigate("Movie", { id: item.id });
                    }}
                  >
                    <Image
                      style={styles.moviePoster}
                      source={{
                        uri:
                          "https://image.tmdb.org/t/p/w500" + item.poster_path
                      }}
                    ></Image>
                    <View style={styles.movieDetails}>
                      <Text
                        numberOfLines={3}
                        style={[styles.whiteText, styles.movieTitle]}
                      >
                        {item.original_title != null
                          ? item.original_title
                          : item.original_name}
                      </Text>
                      <Text style={styles.mutedText}>
                        {item.release_date != null
                          ? "Release Date"
                          : "First Air Date"}{" "}
                        :{" "}
                        {item.release_date != null
                          ? item.release_date
                          : item.first_air_date}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Icon name="star" size={13} color="#faad14" />
                        <Text style={[styles.mutedText, styles.smallText]}>
                          {item.vote_average}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            ></FlatList>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#0F2238",
    paddingHorizontal: 20,
    flexDirection: "column"
  },
  whiteText: {
    color: "white"
  },
  title: {
    fontSize: 25,
    fontWeight: "900",
    marginTop: 20
  },
  search: {
    backgroundColor: "#1F354E",
    width: "100%",
    marginTop: 16,
    borderRadius: 9,
    fontSize: 18,
    height: 40,
    paddingHorizontal: 15,
    color: "white"
  },
  trending: {
    fontWeight: "900",
    width: "100%",
    marginTop: 20
  },
  trendingList: {
    width: "100%"
  },
  movieTile: {
    flexDirection: "row",
    marginVertical: 10,
    alignItems: "center"
  },
  moviePoster: {
    width: "25%",
    height: 120
  },
  movieDetails: {
    width: "70%",
    paddingLeft: 16,
    flexDirection: "column"
  },
  movieTitle: {
    flexWrap: "wrap",
    width: "100%",
    fontSize: 18
  },
  mutedText: {
    color: "#C1C1C1"
  },
  smallText: {
    fontSize: 13
  },
  btnLink: {
    marginTop: 14,
    borderRadius: 8,

    flexDirection: "row",
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  link: {
    color: "#01D277"
  }
});

const TabNavigator = createBottomTabNavigator(
  {
    Home: Home,
    Watchlist: Watchlist
  },
  {
    defaultNavigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        const { routeName } = navigation.state;
        var icon;
        if (routeName == "Home") {
          icon = `home`;
        } else if (routeName == "Watchlist") {
          icon = `list`;
        }

        // You can return any component that you like here!
        return <Icon name={icon} size={25} color={tintColor} />;
      }
    }),
    tabBarOptions: {
      activeTintColor: "#01D277",
      inactiveTintColor: "#2D4765",
      style: {
        backgroundColor: "#071729",
        height: 60,
        paddingVertical: 10
      }
    }
  }
);

export default createAppContainer(TabNavigator);
