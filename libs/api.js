import axios from "axios";
import chunk from "lodash.chunk";

const Api = (token) => {
  return axios.create({
    baseURL: "https://api.spotify.com/v1/",
    headers: {
      authorization: "Bearer " + token,
    },
  });
};

export async function getUserProfile(token) {
  const { data } = await Api(token).get(`/me`);
  return data;
}

export async function fetchPlaylistItems(token, id) {
  const makeRequest = async (link = null) => {
    try {
      const { data } = await Api(token).get(link || `/playlists/${id}/tracks`, {
        params: {
          limit: 50,
        },
      });

      return data;
    } catch (e) {
      throw e;
    }
  };

  const {
    data: { name },
  } = await Api(token).get(`/playlists/${id}`, { fields: "name" });

  let songs = [];
  let next = null;

  // make first request to get total page count and next page
  let { items, total, ...resp } = await makeRequest();
  next = resp.next;

  // set tracks
  songs = songs.concat(items);

  // get the total number of page (default is 50 per page)
  const totalPages = Math.ceil(total / 50);

  // go through total pages and repeat process
  if (totalPages > 1) {
    for (let i = 2; i <= totalPages; i++) {
      // make subsequent requests
      const { items, ...resp } = await makeRequest(next);
      next = resp.next;

      // set tracks
      songs = songs.concat(items);
    }
  }

  return { name, songs };
}

export async function createPlaylist(token, userId, name, trackIds) {
  const {
    data: { id: playlistId },
  } = await Api(token).post(`/users/${userId}/playlists`, { name, public: false });

  // split tracks in chunks
  const arrayOftrackIds = chunk(trackIds, 100);

  for (let trackIds of arrayOftrackIds) {
    await Api(token).post(`/playlists/${playlistId}/tracks`, {
      uris: trackIds,
    });
  }

  return playlistId;
}
