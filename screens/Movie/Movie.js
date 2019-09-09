import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialIcons";
import PersistentData from "../../PersistentData";
import { Rating, AirbnbRating } from "react-native-ratings";

type Props = {};
export default class Movie extends Component<Props> {
  persistentData = new PersistentData();
  state = {
    details: {},
    page: 1,
    reviews: [],
    sessionId: "",
    movieId: 0,
    process: false,
    rated: null,
    ratings: []
  };
  static navigationOptions = {
    headerStyle: {
      backgroundColor: "#1F354E"
    },
    headerTintColor: "white",
    headerTitleStyle: {
      color: "white"
    }
  };
  getDetails(id) {
    axios
      .get(
        "https://api.themoviedb.org/3/movie/" +
          id +
          "?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US"
      )
      .then(data => {
        this.setState({ details: data.data });
        console.log(id, data);
      });
  }
  getReviews(id) {
    console.log(
      "https://api.themoviedb.org/3/movie/" +
        id +
        "/reviews?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US&page=1"
    );
    axios
      .get(
        "https://api.themoviedb.org/3/movie/" +
          id +
          "/reviews?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US&page=1"
      )
      .then(data => {
        console.log(data.data);
        this.setState({ reviews: data.data.results });
      });
  }
  getRating() {
    axios
      .get(
        "https://api.themoviedb.org/3/account/id/rated/movies?api_key=d4c1e78ac700d5161b065701ce386aff&language=en-US&session_id=" +
          this.state.sessionId +
          "&sort_by=created_at.asc&page=1"
      )
      .then(data => {
        console.log("getRating", data.data.results);
        var ratings = data.data.results;
        var rated = ratings.findIndex(movie => {
          return movie.id == this.state.movieId;
        });
        if (rated != -1) {
          this.setState({ rated: ratings[rated].rating });
        }
        this.setState({ ratings: ratings });
      })
      .catch(e => {
        console.log("getRating", e);
      });
  }
  componentDidMount() {
    const { navigation } = this.props;
    const id = navigation.getParam("id", "0");
    this.setState({
      movieId: id
    });
    this.persistentData.getData("sessionId").then(data => {
      this.setState({ sessionId: data });
      this.getRating();
      this.getDetails(id);
      this.getReviews(id);
    });
    console.log(id);
  }
  render() {
    return (
      <ScrollView style={styles.container}>
        <Image
          style={styles.backdrop}
          source={{
            uri:
              "https://image.tmdb.org/t/p/w500" +
              this.state.details.backdrop_path
          }}
        ></Image>
        <View style={styles.details}>
          <Text style={[styles.title, styles.whiteText]}>
            {this.state.details.original_title}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.mutedText, { marginRight: 10 }]}>
              Release Date: {this.state.details.release_date}
            </Text>
            <Icon name="star" size={13} color="#faad14" />
            <Text style={[styles.mutedText]}>
              {this.state.details.vote_average} / 10
            </Text>
          </View>
          {this.state.details.homepage != null ? (
            <TouchableOpacity
              style={styles.btnLink}
              onPress={() => {
                Linking.openURL(this.state.details.homepage);
              }}
            >
              <Icon name="web" size={15} color="white" />
              <Text style={styles.whiteText}> OPEN WEBSITE</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.whiteText}>No Website</Text>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              this.setState({ process: true });
              axios
                .post(
                  "https://api.themoviedb.org/3/account/id/watchlist?api_key=d4c1e78ac700d5161b065701ce386aff&session_id=" +
                    this.state.sessionId,
                  {
                    media_type: "movie",
                    media_id: this.state.movieId,
                    watchlist: true
                  }
                )
                .then(data => {
                  this.setState({ process: false });
                  if (data.data.status_code == 1) {
                    Alert.alert(
                      "Added",
                      "The movie is added to your watchlist"
                    );
                  } else if (data.data.status_code == 12) {
                    Alert.alert(
                      "Existing",
                      "The movie is already in your watchlist"
                    );
                  }
                });
            }}
          >
            {!this.state.process ? (
              <Text style={[styles.whiteText]}>ADD TO WATCHLIST</Text>
            ) : (
              <ActivityIndicator size="small" color="#fff" />
            )}
          </TouchableOpacity>

          {this.state.rated != null ? (
            <TouchableOpacity
              style={styles.btnDanger}
              onPress={() => {
                Alert.alert("Warning", "Are you sure to delete your rating?", [
                  { text: "No" },
                  {
                    text: "Delete",
                    onPress: () => {
                      axios
                        .delete(
                          "https://api.themoviedb.org/3/movie/" +
                            this.state.movieId +
                            "/rating?api_key=d4c1e78ac700d5161b065701ce386aff&session_id=" +
                            this.state.sessionId
                        )
                        .then(data => {
                          if (data.data.status_code == 13) {
                            this.setState({ rated: null });
                          }
                        });
                    }
                  }
                ]);
              }}
            >
              <Text style={styles.whiteText}>DELETE RATING</Text>
            </TouchableOpacity>
          ) : null}
          <Text style={[styles.headerText, styles.whiteText]}>OVERVIEW</Text>
          <Text style={[styles.overview]}>{this.state.details.overview}</Text>
          <Text style={[styles.headerText, styles.whiteText]}>GENRES</Text>
          <FlatList
            horizontal
            data={this.state.details.genres}
            keyExtractor={item => item.name}
            renderItem={({ item }) => {
              return <Text style={styles.overview}>{item.name} </Text>;
            }}
          ></FlatList>
          <Text style={[styles.headerText, styles.whiteText]}>
            YOUR RATING (SWIPE TO RATE)
          </Text>
          <View style={styles.buttons}>
            {this.state.rated == null ? (
              <Rating
                showRating
                minValue={0.5}
                type="custom"
                ratingCount={10}
                imageSize={25}
                onFinishRating={rate => {
                  console.log(this.state.sessionId, this.state.movieId);
                  Alert.alert(
                    "Rate",
                    "You are rating " + rate + " for this movie",
                    [
                      {
                        text: "Cancel"
                      },
                      {
                        text: "Yup",
                        onPress: () => {
                          console.log(
                            "https://api.themoviedb.org/3/movie/" +
                              this.state.movieId +
                              "/rating?api_key=d4c1e78ac700d5161b065701ce386aff&session_id=" +
                              this.state.sessionId
                          );
                          axios
                            .post(
                              "https://api.themoviedb.org/3/movie/" +
                                this.state.movieId +
                                "/rating?api_key=d4c1e78ac700d5161b065701ce386aff&session_id=" +
                                this.state.sessionId,
                              { value: rate }
                            )
                            .then(data => {
                              console.log(data);
                              this.getRating();
                              if (data.data.status_code == 1) {
                                // this.setState({rated:rate})
                              }
                            });
                        }
                      }
                    ]
                  );
                }}
                style={{
                  paddingVertical: 10,
                  width: "100%",
                  backgroundColor: "#0F2238"
                }}
              />
            ) : (
              <View>
                <Text style={[styles.whiteText, styles.overview]}>
                  You rated this movie {this.state.rated} / 10
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.headerText, styles.whiteText]}>REVIEWS</Text>
          <FlatList
            data={this.state.reviews}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              return (
                <View style={styles.review}>
                  <Text style={[styles.whiteText, styles.author]}>
                    {item.author}
                  </Text>
                  <Text style={styles.overview}>{item.content}</Text>
                  {/* <Text style={styles.overview}>{item.content.length>200? item.content.slice(0,200)+'...':item.content}</Text> */}
                </View>
              );
            }}
          ></FlatList>
        </View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F2238"
  },
  backdrop: {
    height: 170,
    width: "100%"
  },
  whiteText: {
    color: "white"
  },
  details: {
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "900"
  },
  headerText: {
    marginTop: 14,
    fontSize: 10,
    fontWeight: "900"
  },
  overview: {
    marginTop: 5,
    color: "#E5E5E5"
  },
  mutedText: {
    color: "#C1C1C1"
  },
  btnLink: {
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: "#01D277",
    flexDirection: "row",
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  btnDanger: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ff4d4f",
    flex: 1,
    marginTop: 10
  },
  review: {
    marginTop: 20,
    backgroundColor: "#1F354E",
    borderRadius: 8,
    padding: 15
  },
  author: {
    fontSize: 14,
    fontWeight: "900"
  },
  buttons: {
    flexDirection: "row"
  },
  button: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#1F354E",
    flex: 1,
    marginTop: 10
  }
});
