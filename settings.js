module.exports = {
  /**
   * The port that the server will listen on
   */
  port: process.env.PORT || 3000,

  /**
   * The IRC nick that server should use
   */
  nick: 'help',

  /**
   * The prefix to use for all adhoc channels
   */
  channelPrefix: 'help-',

  /**
   * The title of each chat window
   */
  windowTitle: 'Help',

  /**
   * The prefix to use for all incoming IRC messages
   * Supports all variables in the /chat query string
   */
  messagePrefix: '{{name}}: ',

  /**
   * Sets the log level. Use `debug` to see all incoming and outgoing messages
   */
  logLevel: 'info',

  /**
   * Configuration to be passed to node-irc
   * See: https://node-irc.readthedocs.org/en/latest/API.html#irc.Client
   */
  irc: {
    /**
     * The IRC server to connect to
     */
    host: 'localhost',

    /**
     * The port to connect to
     */
    port: 6667,

    /**
     * List of channels to join on connection
     */
    channels: [
      "#help"
    ]
  },

  messages: {
    /**
     * Message sent when a new chat is created
     * Available variables are: {{channel}} and any variables passed
     * in the /chat query string
     */
    alert: '{{name}} needs your Help! Join {{channel}} to provide support.',

    /**
     * Message sent to a helper when they join a room
     * Available variables are: {{helper}} (the helper's nickname) and any variables passed
     * in the /chat query string
     */
    join: 'Hello {{helper}}! {{name}} is looking for some help.',

    /**
     * Message shown to the user when they open a new chat window
     * Available variables are any variables passed in the /chat query string
     */
    welcome: 'Hi <b>{{name}}</b>. Someone will be here to help soon.'
  }
}
