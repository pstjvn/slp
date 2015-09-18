### SLP - Simple Local Proxy

Simple proxy to use in development.

Aimed at frontend developes who need to access resources from JS that are
violating the same domain policy.

The proxy serves files from local file system, but a configuration file is used
to configure matcing patterns that are piped to the actual remote resource as
if local and pipes the result back.

Possible use case: you need to query staging or production service without
actually putting your work on it - in this case use local frontend files and
only pipe the requests you need.

Example config is included

Currently you can match by string and replace, prepend or append to the path
portion of the url.

Options:

```--config``` - tell the script where to find your config file, by default the example one is used.

```--host``` - tell the web server on which IP/host to listen on.

```--port``` - tell the web server on which port to listen on.

```--root``` - tell the server where is the root of the FS to server.

By default the host and port are read from the environment in order to allow the
implementation to work in cloud based IDE/development environment where you do
not have control over those.

By default the server serves all files one dirrectory above it ('../').