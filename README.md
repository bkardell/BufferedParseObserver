BufferedParseObserver
====

Frequently in the course of extending the web forward, we basically want to get at things "as parsed" for prollyfilling use cases like:

* HTML Imports use `<link>` tags to signal things that need to be downloaded and imported
* Recently there has been discussion about how you might add preloading, promises, dependency attributes to `<script>` elements (see WHATWG archives) - RequireJS has “data-main” as another example.
* Anything that prollyfills CSS examines `<link>` or `<style>` tags, like Hitch does.
* Anything that uses string based templates by way of `<link>` or `<script>` tags that need to be downloaded or compiled, like Handlebars does.

Most of these prollyfills currently use DOMContentLoaded but we'd like to get things in earlier. Using DOMContentLoaded means early latency on large pages or slow network connections or a laggy browser (mobilie, for example).  To to make matters worse, by the time it happens, the request queue is usually full with things from the page itself queued up by parse.  On mobile, for example, sometimes it is frequently seconds before the process that would otherwise be handled by the browser "begins in earnest".  Alternatives tried in the past have involved specific ordering of scripts "include this as the last thing in your head" for example. This is cumbersome and confusing for authors - only one thing can be first or last, and it doesn't cover otherwise potentially valid cases - for example, `<link>` or `<style>` can appear in the `<body>` too. All of this means that today these prollyfills are low fidelity on these aspects. 

Can we do better?  
==================
I'm not really sure, but I'd like to try.... So, here are:
* A
[low-level proposal](https://github.com/bkardell/BufferedParseObserver/blob/master/proposal.md) to get things rolling
* A [demo which collects perf data via firebase so we can discuss](https://bkardell.github.io/BufferedParseObserver).
* A [link to the collected data](http://bkardell.github.io/BufferedParseObserver/data.html)

Based on this...
================
I've put together a kind of [pluggable proposal that provides fairly easy answers to most of the bullets above](http://bkardell.github.io/BufferedParseObserver/sample-use/deferred-link.html), 
it contains samples/tests/demos inline.

Then what?
==========
Discuss on the [public-nextweb@w3.org](W3C Extensible Web Group), fork, file issue... Have at it.
