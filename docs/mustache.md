## How to use Mustache without koa-mustache

Template: The parent file (like index.html, about.html, contact.html) and it has {{}} and {{{}}} entries where the code goes. ({{ }} is for normal data key-value pairs and {{{ }}} is for html code without escaping the `<>` signs)

Data or View: Key-value pairs that are saved as a json file or as the export of a js file.

Partials: These are html files that go in the {{{ }}} tags, stuff like the whole article, and if it's made in Markdown, then there should be an extra parser custom made for the purpose.


```js
return Mustache.render(template, data, partials)
```

## Why Mustache should be used without koa-mustache

In my opinion, both data and partial files should be required inside the GET responder in order to keep info fresh. It's not too heavy for the server to process and the database can be updated and refilled without restarting the Koa server (as is the case with koa-mustache).
