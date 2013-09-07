Definition
====
A `BufferedParseObserver` provides information about tags in the document as the stream is being parsed. It is connected to the parse stream which lazily flushes buffered notifications about any tag it is observing.

Creating a `BufferedParseObserver`
====
Authors can create a `BufferedParseObserver` by indicating the tag name in the constructor, as in: 

```js
var bodyTagParseObserver = new BufferedParseObserver('body');
```

Registering for notifications
====
Once created, an instance of a `BufferedParseObserver` may be used to receive notifications from the stream by providing a handler for the `notify` event.  It is passed an array of elements as they are flushed.

```js
var bodyTagParseObserver = new BufferedParseObserver('body');
bodyTagParseObserver.on("notify", function (arr) { 
    console.log("Got the body element ->" + arr[0]); 
});
```
*Note: How often and when flushes happen is up to implementations. It is possible that the document may not be finished parsing the children of elements received, but parsing always moves forward, thus in the example above, one could surmise that document.head was fully available.*

Disconnecting an Observer
====
`BufferedParseObserver`  also have a `disconnect()` method which causes them to stop receiving notifications. This can be called, for example, from a callback in the event that an author is satisfied and no longer needs to receive notifications:

```js
bodyTagParseObserver.on("notify", function (arr) { 
    console.log(
        "The head is finished parsing " 
        + document.head.childNodes.length
        + elements
    ); 

    // There's nothing more to see here...
    this.disconnect();
);
```
*An observer is automatically disconnected upon triggering of DOMConentLoaded*

Done and Promises
=====
An observer is said to be `done` when it is disconnected and any work promised by it has been completed. Callbacks may return promised work and the observer will track these and delay `done` until these are resolved: 

```js
bodyTagParseObserver.on("notify", function (arr) { 
    // There's nothing more to see here...
    this.disconnect();

    // Load some js... (contrived example)
    return $.getScript("somefile.js");
);


bodyTagParseObserver.on("done", function () {
    console.log(
        "the stream is disconnected"
        + "and any promises made to the "
        + "observer are resolved."
    );
});
```