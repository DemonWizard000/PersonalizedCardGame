using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;
using Nancy.Json;
using System;
using System.Linq;
using System.Collections.Concurrent;
using PersonalizedCardGame.Models;
using PersonalizedCardGame;
using System.Text;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json.Linq;
using Microsoft.EntityFrameworkCore;

namespace PersonalizedCardGame.Hubs
{
    public class GameClass : Hub
    {
        public static List<string> ConnectionIds = new List<string>();
        public static bool IsBusy = false;
        private static readonly ConcurrentDictionary<string, string> Users = new ConcurrentDictionary<string, string>();
        private readonly DBCardGameContext _dbCardGameContext;
        public GameClass(DBCardGameContext dbCardGameContext)
        {
            _dbCardGameContext = dbCardGameContext;
        }

        /*
            Send "ReceiveMessage" to all clients.
        */
        public int SendMessage(string user, string message)
        {
            try
            {
                if (IsBusy == false)
                {
                    IsBusy = true;
                    var val1 = Context.ConnectionId;
                    var val2 = Context.User;
                    var val3 = Clients.Caller;

                    ConnectionIds.Add(user + "===" + message);

                    Clients.All.SendAsync("ReceiveMessage", user, message);
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
            catch (Exception ex)
            {
                return -1;
            }
        }

        /*
        Send "ReciveNotification" to all Clients.
        @param
        gamecode: GameCode that will receive notfication.
        playerid: PlayerId that send notficiation.
        notificationmessage: message
        */
        public async Task SendNotification(string gamecode, string playerid, string notificationmessage)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveNotification", gamecode, playerid, notificationmessage);
        }

        public async Task GameLog(string GameCode, string ActionName, string PlayerUniqueId, string PlayerName)
        {

        }

        /*
         SendRemoveNotification
         */
        public async Task SendRemoveNotification(string GameCode, string UserId)
        {
            var player = await _dbCardGameContext.Player.Where(x => x.GameCode == GameCode && x.PlayerUniqueId == UserId).FirstOrDefaultAsync();
            var val1 = Context.ConnectionId;
            await Clients.Client(player.SignalRconnectionId).SendAsync("RemovedNotification");
        }

        /*
        Send "ReceiveEndGameSummary"
        @param
        gamecode: GameCode that send notification
        */
        public async Task SendEndGameSummary(string gamecode)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveEndGameSummary", gamecode);
        }

        /*
        Send "ReceiveEndHandSummary"
        @param
        gamecode: GameCode that send notification
        */
        public async Task SendEndHandSummary(string gamecode)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // ConnectionIds.Add(user + "===" + message);

            await Clients.All.SendAsync("ReceiveEndHandSummary", gamecode);
        }

        //same as SendMessage
        public async Task SendMessage2(string user, string message, string test)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            ConnectionIds.Add(user + "===" + message);

            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(ConnectionIds); // {"Name":"C-

            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        //same as SendMessage    
        public async Task ReceiveOnLoad(string user, string message)
        {
            var val1 = Context.ConnectionId;
            var val2 = Context.User;
            var val3 = Clients.Caller;

            // string val1 = "";
            JavaScriptSerializer js = new JavaScriptSerializer();
            string jsonData = js.Serialize(ConnectionIds); // {"Name":"C-

            await Clients.All.SendAsync("ReceiveMessage", user, jsonData);
        }

        // when you connect to GameClass Hub, this function invoked.
        public override Task OnConnectedAsync()
        {

            HttpContext httpContext = Context.GetHttpContext();

            //Get PlayerUniqueId of connecting user
            /*var customQuerystring = httpContext.Request.QueryString.Value.Split("&").FirstOrDefault().Split("=").LastOrDefault();

            if (customQuerystring != null)
            {
                //If player already added to Database, just change player's Modified time and isConnected = true, SignalRconnectionId as new connectionId.
                var player = _dbCardGameContext.Player.Where(x => x.PlayerUniqueId == customQuerystring).FirstOrDefault();
                if (player != null)
                {
                    player.LastActionTime = DateTime.Now;
                    player.Modified = DateTime.Now;
                    player.SignalRconnectionId = Context.ConnectionId;
                    player.IsConnected = true;
                    _dbCardGameContext.SaveChanges();
                }

                //If not exist, Add new player
                else
                {
                    _dbCardGameContext.Player.Add(new Player() { Created = DateTime.Now, IsConnected = true, LastActionTime = DateTime.Now, PlayerUniqueId = customQuerystring, SignalRconnectionId = Context.ConnectionId });
                    _dbCardGameContext.SaveChanges();
                }
            }*/
            return base.OnConnectedAsync();
        }

        //when you close connection, this function invokes.
        public override Task OnDisconnectedAsync(Exception exception)
        {

            try
            {
                //Get disconnectedplayer
                var disconnectedplayer = _dbCardGameContext.Player.Where(x => x.SignalRconnectionId == Context.ConnectionId).FirstOrDefault();

                if (disconnectedplayer != null)
                {
                    //If disconnectedplayer currently join game and active, set him deactive.
                    if (disconnectedplayer.GameCode != "" && disconnectedplayer.GameCode != null)
                    {
                        disconnectedplayer.IsConnected = false;
                        disconnectedplayer.IsActive = false;
                        disconnectedplayer.IsCurrent = false;
                        disconnectedplayer.IsDealer = false;
                        disconnectedplayer.IsFolded = false;

                        _dbCardGameContext.SaveChanges();

                        //all other players in the same game
                        var allrelatedplayers = _dbCardGameContext.Player.Where(x => x.GameCode == disconnectedplayer.GameCode && x.SignalRconnectionId != Context.ConnectionId).ToList();
                        foreach (var ar in allrelatedplayers)
                        {
                            //Send "OtherPlayerDisconnected" msg.
                            Clients.Client(ar.SignalRconnectionId).SendAsync("OtherPlayerDisconnected", disconnectedplayer.PlayerUniqueId, disconnectedplayer.UserName);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
            }

            Task tsk = new Task(() =>
            {

            });

            return tsk;
        }
    }
}