import React from "react";
import {
  Button,
  Container,
  chakra,
  Heading,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  Stack,
  Text,
  Link,
} from "@chakra-ui/react";
import { useOauth2Login } from "libs/react-oauth2";
import { fetchPlaylistItems, getUserProfile, createPlaylist } from "libs/api";

export default function Home() {
  const [accessToken, setAccessToken] = React.useState();
  const [newPlaylistId, setNewPlaylistId] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState();

  const spotifyAuthUrl = React.useMemo(() => {
    const url = `https://accounts.spotify.com/authorize`;
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
      redirect_uri: process.env.NEXT_PUBLIC_APP_URL,
      response_type: "token",
      scope: "user-library-read playlist-read-private playlist-modify-public playlist-modify-private",
    }).toString();

    return `${url}?${params}`;
  }, []);
  const spotifyLogIn = useOauth2Login({ url: spotifyAuthUrl, id: "spotify-login", withHash: true });

  const onSubmit = async (e) => {
    e.preventDefault();
    const link = e.target["playlistLink"].value;

    // trim link
    const playlistId = link.replace("https://open.spotify.com/playlist/", "").split("?")[0];

    const data = await spotifyLogIn();
    if (!data.access_token) {
      throw new Error("Login failed");
    }
    const accessToken = data.access_token;

    // fetch playlist content
    const { songs, name } = await fetchPlaylistItems(accessToken, playlistId);

    // get user profile
    const { id } = await getUserProfile(accessToken);
    console.log(songs, name, id);

    const newPlaylistId = await createPlaylist(
      accessToken,
      id,
      `${name} Clone`,
      songs.map((song) => `spotify:track:${song.track.id}`)
    );

    setNewPlaylistId(newPlaylistId);
    try {
      setIsLoading(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.sm" py={8}>
      <Stack mb={12}>
        <Heading>Peetch</Heading>
        <Text>Quickly clone any spotify playlist</Text>
      </Stack>

      <Stack spacing={4} as="form" onSubmit={onSubmit}>
        <FormControl isInvalid={!!error}>
          <FormLabel>Playlist link</FormLabel>
          <Input
            type="url"
            name="playlistLink"
            placeholder="https://open.spotify.com/playlist/.."
            pattern="^https:\/\/open\.spotify\.com\/playlist\/.*"
          />

          {!error ? (
            <FormHelperText>
              The link has to match this format (https://open.spotify.com/playlist/playlistId)
            </FormHelperText>
          ) : (
            <FormErrorMessage>{error}</FormErrorMessage>
          )}
        </FormControl>

        <chakra.div>
          <Button type="submit" colorScheme="purple" isLoading={isLoading}>
            Clone
          </Button>
        </chakra.div>

        {newPlaylistId && (
          <Text>
            Playlist now cloned.{" "}
            <Link color="purple.500" target="_blank" href={`https://open.spotify.com/playlist/${newPlaylistId}`}>
              Here is your playlist link
            </Link>
          </Text>
        )}
      </Stack>
    </Container>
  );
}
