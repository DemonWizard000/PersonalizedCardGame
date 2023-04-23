using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;
using Nancy.Json;
using System;

namespace SignalRChat.Hubs
{
    public class MyHub : Hub
    {
        public static List<string> lst = new List<string>();

        public async Task SendMessage(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            lst.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public async Task SendMessage2(string user, string message, string test)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            lst.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }




        public async Task ReceiveOnLoad(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // string val1 = "";
            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(lst); // {"Name":"C-



            await Clients.All.SendAsync("ReceiveMessage", user, jsonData);
        }


        public override Task OnConnectedAsync()
        {

            //var x = Clients.Caller
            var xx = Context.GetHttpContext();

            UserHandler.ConnectedIds.Add(Context.ConnectionId);
            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {

            UserHandler.ConnectedIds.Remove(Context.ConnectionId);
            return base.OnConnectedAsync();
        }


    }

    public static class UserHandler
    {
        public static HashSet<string> ConnectedIds = new HashSet<string>();
    }



    public class UserConnection
    {
        public string UserName { get; set; }

        public string UserUniqueId { get; set; }

        public string ConnectionId { get; set; }


    }


}