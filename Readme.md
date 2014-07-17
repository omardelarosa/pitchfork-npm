#Pitchfork Client

An unofficial Pitchfork API client for Node.js based on the [Pitchfork API Client for Python](https://github.com/michalczaplinski/pitchfork).

## API

### Search

### Review

```.attributes```

An {Object} with information about the album and its text.  Sample below:

```
{
  "url": "/reviews/albums/19466-mogwai-come-on-die-young-deluxe-edition/",
  "name": "Mogwai - Come On Die Young ",
  "artist": "Mogwai",
  "album": "Come On Die Young",
  "title": "Mogwai: Come On Die Young | Album Reviews | Pitchfork",
  "label": "Chemikal Underground",
  "year": "1999/2014",
  "score": 8.3,
  "cover": "http://cdn3.pitchfork.com/albums/20688/homepage_large.2ac360a5.jpg",
  "author": "Mark Richardson",
  "date": "June 18, 2014",
  "editorial": {
    "text": " Though few of their songs contain actual words, Mogwai have always been fond of big statements. Having emerged during the late-1990s post-rock boom, the Scottish quintet used every means possible to distance themselves from the sullen stereotype that defined so many instrumental art-rock brooders o...",
    "html": "<p>Though few of their songs contain actual words, Mogwai have always been fond of big statements. Having emerged during the late-1990s post-rock boom, the Scottish quintet used every means possible to distance themselves from the sullen stereotype that defined so many instrumental art-rock brooders of their era. EP titles were <a href=\"http://en.wikipedia.org/wiki/No_Education_%3D_No_Future_(Fuck_the_Curfew)\" target=\"_blank\" rel=\"nofollow\">"
}
```

```.truncated()```

## CLI (Command-Line Interface)

Returns a review for a given artist.

```
$ pitchfork -a 'radiohead' -t 'ok computer'

{ name: }

```

### Flags

| flag(s)      |  required | argument    | description  |
| -------      | ---- | ---------   | ------------ |
| -a           |  y  | artist_name |  returns a review by given artist           |
| -t           |    | album_title |  returns a review by given album title |
| -j,--json     |   |    |  returns review attributes as un-prettified json |
| -v, --verbose  |  |    |  returns review entire object as json |
| -V, --version   |  |    | returns version number |
| -T,--truncated |  |    |  returns a truncated json object of the review attributes | 
| -tx,--text      |  |    | returns a text version of review (hint: pipe output to less ) |

