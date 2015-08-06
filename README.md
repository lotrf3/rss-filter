# RSS Filter

RSS Filter is a proxy server that filters out undesired RSS entries. [A hosted version is available](rssfilter-lotrf3.rhcloud.com), or you can host your own.

[This page](rssfilter-lotrf3.rhcloud.com/index.html) can help format and encode a `/filter?` url, or you can write it manually. One you have a `/filter?` url, use it in your RSS aggregator of choice.

## Example
Here's an example I actually use
```
/filter?url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3DUC0G2qz-hoaCswQNgoWU_LTw
&path=feed.entry
&q=%7B%22is%22%3A%5B%22title.0%22%2C%22.*StarCraft.*%22%5D%7D
```
Each component is percent encoded for the server's sanity. But here is the same example without percent encoding for clarity
```
/filter?url=https://www.youtube.com/feeds/videos.xml?channel_id=UC0G2qz-hoaCswQNgoWU_LTw
&path=feed.entry
&q={"is":["title.0",".*StarCraft.*"]}
```

## Parameters
- `url` is the url of the original RSS feed
- `path` is the dot separated path to the RSS entries
- `q` is the query represented by nested JSON. Each object is either:
  - `and` is an array of entries, where each entry must return true before filtering will occur
  - `or` is an array of entries, where at least one entry must return true for filtering to occur
  - `is` is a two element array. Filters everything that matches a regular expression. 
    - The first element is the dot separated path to XML node being tested
    - The second element is a regular expresson the XML node is matched against
  - `isnot` is the inverse of `is`

Here's an example of the logic at work in query.
```
{
  "and":[
    "or":[
      "isnot":["title.0",".*Extra History.*"],
      "isnot":["title.0",".*Extra Credits.*"]
    ],
  "is":["author.0.name.0","Extra Credits"]
  ]
}
```
Sorry, the `.0` is needed or the XML parser gets cranky.

## Notes
While intended for filtering RSS, nothing is stopping you from using it against arbitrary XML.

...and yes, a GUI for writing queries is on the ToDo list.

