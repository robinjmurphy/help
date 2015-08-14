(function () {
  var socket = io();
  var chat = document.querySelector('.chat')
  var messages = document.querySelector('.messages');
  var chatBox = document.querySelector('input');
  var room = chat.dataset.channel;
  var query = JSON.parse(chat.dataset.query);

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
  }

  function appendMessage(sender, message, className) {
    var el = document.createElement('p');
    el.innerHTML = '<span class="sender">' + sender + '</span> ' + linkify(message);
    el.className = 'message';
    if (className) el.className += ' ' + className;
    messages.appendChild(el);
    scrollToBottom();
  }

  function appendInfoMessage(message) {
    var el = document.createElement('p');
    el.innerHTML = message;
    el.className = 'message info';
    messages.appendChild(el);
    scrollToBottom();
  }

  socket.on('connect', function () {
    socket.emit('join room', room);
  });

  socket.on('message', function (data) {
    appendMessage(data.helper, data.message);
  });

  socket.on('join', function (helper) {
    console.info(helper, 'joined the room');
    appendInfoMessage('<b>' + helper + '</b> joined the room');
  });

  socket.on('part', function (helper) {
    console.info(helper, 'left the room');
    appendInfoMessage('<b>' + helper + '</b> left the room');
  });

  chatBox.addEventListener('keypress', function (e) {
    var key = e.which || e.keyCode;

    if (key === 13 && chatBox.value.trim() !== '') {
      socket.emit('message', {
        query: query,
        room: room,
        message: chatBox.value
      });
      appendMessage('me', chatBox.value, 'user');
      chatBox.value = '';
    }
  });
})();
