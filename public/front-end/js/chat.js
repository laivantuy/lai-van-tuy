
        $(function () {
                var socket = io();
                $('form').submit(function () {
                    socket.emit('chat message', $('#m').val());
                    $('#m').val('');
                    return false;
                });
                socket.on('chat message', function (msg) {
                    $('#messages').append($('<ul>').text(msg));
                });
        });
        
         $(function() {
    
             $('#live-chat header').on('click', function() {
    
                 $('.chat').slideToggle(300, 'swing');
                 $('.chat-message-counter').fadeToggle(300, 'swing');
    
             });
             
             $('.chat-close').on('click', function(e) {
    
                 e.preventDefault();
                 $('#live-chat').fadeOut(300);
    
             });
    
         });