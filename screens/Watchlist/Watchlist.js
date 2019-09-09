import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import axios from "axios";
import PersistentData from "../../PersistentData";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {};
export default class Watchlist extends Component<Props> {
  state = {
    list: [],
    refreshing: false
  };
  persistentData = new PersistentData();
  componentDidMount() {
    this.getWatchList();
  }
  getWatchList() {
    this.setState({ refreshing: true });
    this.persistentData.getData("sessionId").then(data => {
      axios
        .get(
          "https://api.themoviedb.org/3/account/id/watchlist/movies?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US&session_id=" +
            data +
            "&sort_by=created_at.asc&page=1"
        )
        .then(data => {
          this.setState({ refreshing: false, list: data.data.results });
          console.log(data);
        });
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <Text style={[styles.titleCaps, styles.whiteText]}>YOUR WATCHLIST</Text>
        <FlatList
          refreshing={this.state.refreshing}
          keyExtractor={item => item.poster_path}
          onRefresh={() => {
            this.getWatchList();
          }}
          style={styles.watchList}
          data={this.state.list}
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
                    uri: "https://image.tmdb.org/t/p/w500" + item.poster_path
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
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
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
    fontWeight: "900"
  },
  titleCaps: {
    fontWeight: "900",
    width: "100%",
    marginTop: 20
  },
  watchList: {
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
