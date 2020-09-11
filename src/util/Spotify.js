const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_REDIRECT_URI;
let accessToken;

const Spotify = {

    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        let url = window.location.href;
        const foundAccessToken = url.match(/access_token=([^&]*)/);
        const foundExpiresIn = url.match(/expires_in=([^&]*)/);
            
        if(foundAccessToken && foundExpiresIn) {
            accessToken = foundAccessToken[1];
            let expiresIn = Number(foundExpiresIn[1]);
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            window.location = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&scope=playlist-modify-public&redirect_uri=${REDIRECT_URI}`;        }
    },

    savePlaylist(playlistName, trackURIs) {
        if (playlistName && trackURIs) {
            this.getAccessToken();
            const headers = {Authorization: `Bearer ${accessToken}`};
            let userID = '';
            const userEndpoint = 'https://api.spotify.com/v1/me';

            // get user ID
            return fetch(userEndpoint, {headers: headers}).then(response => {
                return response.json();
            }).then(jsonResponse => {
                userID = jsonResponse.id;

                // POST request for new playlist
                const playlistEndpoint = `https://api.spotify.com/v1/users/${userID}/playlists`;
                return fetch(playlistEndpoint, {
                    headers: headers,
                    method: "POST",
                    body: JSON.stringify({
                        name: playlistName
                    })
                }).then(response => {
                    return response.json();
                }).then(jsonResponse => {
                    let playlistID = jsonResponse.id;

                    return fetch(`${playlistEndpoint}/${playlistID}/tracks`, {
                        headers: headers,
                        method: "POST",
                        body: JSON.stringify({uris: trackURIs})
                    });
                })
            });
        } else {
            return;
        }
        
    },

    search(term) {
        this.getAccessToken();
        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                    if (jsonResponse.tracks) {
                      return jsonResponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artists[0].name,
                        album: track.album.name,
                        uri: track.uri
                      }));
                    }
                }
            );
    }
};

export default Spotify;